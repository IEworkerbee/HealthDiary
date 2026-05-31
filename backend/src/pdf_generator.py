#This module is a one-page pdf generator for healthcare professionals 
# It uses WeasyPrint to generate and a Jinja2 template to format the PDF

"""
For examples:
CLI usage (from the backend/ directory):
    python -m src.pdf_export sample            # writes health_report.pdf
    python -m src.pdf_export sample out.pdf    # writes to a chosen path
"""

from __future__ import annotations

import logging
import sys
from collections import Counter
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any, Optional

from jinja2 import Template

logger = logging.getLogger(__name__)


_IMPACT_ORDER = ("none", "mild", "moderate", "severe", "unable")


#----------Normalization and Formatting helpers----------- 
def _parse_datetime(value: Any) -> Optional[datetime]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None

        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        try:
            return datetime.fromisoformat(text)
        except ValueError:
            logger.warning("Could not parse datetime from %r", value)
            return None
    return None


def _format_datetime(value: Any) -> str:

    dt = _parse_datetime(value)
    if dt is None:
        return "—"
    return dt.strftime("%Y-%m-%d %H:%M")


def _clean_str(value: Any) -> str:

    if value is None:
        return "—"
    text = str(value).strip()
    return text if text else "—"


def _format_severity(value: Any) -> str:

    if value is None or value == "":
        return "—"
    try:
        return str(int(value))
    except (TypeError, ValueError):
        return "—"


def _format_triggers(value: Any) -> str:

    if not value:
        return "—"
    if isinstance(value, str):
        text = value.strip()
        return text if text else "—"
    items = [str(t).strip() for t in value if str(t).strip()]
    return ", ".join(items) if items else "—"


def _normalize_medications(value: Any) -> list[dict[str, str]]:

    if not value:
        return []
    rows: list[dict[str, str]] = []
    for med in value:
        if not isinstance(med, Mapping):
            continue
        rows.append(
            {
                "name": _clean_str(med.get("name")),
                "dose": _clean_str(med.get("dosage")),
                "unit": _clean_str(med.get("unit")),
                "time_taken": _format_datetime(med.get("time_taken")),
            }
        )
    return rows


#------This for the pdf generator not api route
def _build_event_row(entry: Mapping) -> dict[str, Any]:

    return {
        "main_symptom": _clean_str(entry.get("main_symptom")),
        "event_datetime": _format_datetime(entry.get("event_datetime")),
        "severity": _format_severity(entry.get("pain_level")),
        "functional_impact": _clean_str(entry.get("functional_impact")),
        "medications": _normalize_medications(entry.get("medications")),
        "current_treatment": _clean_str(entry.get("current_treatment")),
        "triggers": _format_triggers(entry.get("triggers")),
    }


def _aggregate_condition(
    entries: list[Mapping], condition_name: Optional[str]
) -> dict[str, Any]:
    """Condense many entries into a single Condition Overview summary.

    """
    symptoms = [
        str(e.get("main_symptom")).strip()
        for e in entries
        if e.get("main_symptom")
    ]
  
    if condition_name:
        name = condition_name
    elif symptoms:
        name = Counter(symptoms).most_common(1)[0][0]
    else:
        name = "—"

    dates = [
        dt
        for dt in (_parse_datetime(e.get("event_datetime")) for e in entries)
        if dt is not None
    ]
    if dates:
        date_range = f"{min(dates):%Y-%m-%d} → {max(dates):%Y-%m-%d}"
    else:
        date_range = "—"


    pains: list[int] = []
    for e in entries:
        pl = e.get("pain_level")
        if pl is None or pl == "":
            continue
        try:
            pains.append(int(pl))
        except (TypeError, ValueError):
            continue
    if pains:
        severity = f"min {min(pains)} / max {max(pains)} / avg {sum(pains) / len(pains):.1f}"
    else:
        severity = "—"


    worst_idx = -1
    for e in entries:
        impact = e.get("functional_impact")
        if impact is None:
            continue
        impact = str(impact).strip().lower()
        if impact in _IMPACT_ORDER:
            worst_idx = max(worst_idx, _IMPACT_ORDER.index(impact))
    worst_impact = _IMPACT_ORDER[worst_idx] if worst_idx >= 0 else "—"


    med_names: list[str] = []
    for e in entries:
        for med in e.get("medications") or []:
            if isinstance(med, Mapping) and med.get("name"):
                med_names.append(str(med["name"]).strip())
    unique_meds = ", ".join(sorted(set(n for n in med_names if n))) or "—"

    # Current treatment across entries.
    treatments = sorted(
        {
            str(e.get("current_treatment")).strip()
            for e in entries
            if e.get("current_treatment") and str(e.get("current_treatment")).strip()
        }
    )
    current_treatments = ", ".join(treatments) or "—"

    # Most-frequent triggers (top 5)
    trigger_counter: Counter[str] = Counter()
    for e in entries:
        for t in e.get("triggers") or []:
            t = str(t).strip()
            if t:
                trigger_counter[t] += 1
    top_triggers = ", ".join(t for t, _ in trigger_counter.most_common(5)) or "—"

    return {
        "name": name,
        "date_range": date_range,
        "event_count": len(entries),
        "severity": severity,
        "worst_impact": worst_impact,
        "unique_medications": unique_meds,
        "current_treatments": current_treatments,
        "top_triggers": top_triggers,
    }



# Inline Jinja2 template (HTML + embedded CSS)

_TEMPLATE = Template(
    """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
    @page {
        size: Letter;
        margin: 1.5cm;
        @bottom-center {
            content: "All information is self-reported by the patient and is provided for "
                     "informational purposes only; it does not constitute a clinical diagnosis.";
            font-size: 6.5pt;
            color: #555;
        }
    }
    * { box-sizing: border-box; }
    body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 8.5pt;
        color: #111;
        margin: 0;
        line-height: 1.25;
    }
    h1 {
        font-size: 14pt;
        margin: 0 0 2px 0;
    }
    .meta {
        font-size: 7.5pt;
        color: #444;
        margin-bottom: 6px;
    }
    h2 {
        font-size: 10pt;
        margin: 8px 0 3px 0;
        border-bottom: 1px solid #333;
        padding-bottom: 1px;
    }
    .self-reported {
        font-size: 7pt;
        font-style: italic;
        color: #a33;
        margin: 0 0 4px 0;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
    }
    th, td {
        border: 0.5pt solid #bbb;
        padding: 2px 4px;
        text-align: left;
        vertical-align: top;
    }
    th {
        background: #eee;
        font-weight: bold;
    }
    .field-label {
        font-weight: bold;
        white-space: nowrap;
        width: 22%;
    }
    .meds-table th, .meds-table td {
        font-size: 7.5pt;
        padding: 1px 3px;
    }
    .meds-table {
        margin: 2px 0;
    }
    .event-card {
        border: 0.5pt solid #999;
        padding: 3px 5px;
        margin-bottom: 5px;
    }
    .event-title {
        font-weight: bold;
        font-size: 9pt;
        margin-bottom: 2px;
    }
    .kv td { border: none; padding: 1px 4px 1px 0; }
    .kv .field-label { width: 26%; }
    .none { color: #777; }
    .footer-note {
        margin-top: 6px;
        font-size: 6.5pt;
        color: #555;
        border-top: 0.5pt solid #ccc;
        padding-top: 2px;
    }
</style>
</head>
<body>
    <h1>{{ title }}</h1>
    <div class="meta">
        {% if patient_name %}Patient: {{ patient_name }} &nbsp;|&nbsp; {% endif %}
        Generated: {{ generated_at }}
    </div>

    {% if events %}
    <h2>Event Log</h2>
    <p class="self-reported">Self-reported events logged by the patient.</p>
    {% for ev in events %}
    <div class="event-card">
        <div class="event-title">{{ ev.main_symptom }} &mdash; {{ ev.event_datetime }}</div>
        <table class="kv">
            <tr>
                <td class="field-label">Severity (self-reported, 1-10)</td>
                <td>{{ ev.severity }}</td>
                <td class="field-label">Functional impact</td>
                <td>{{ ev.functional_impact }}</td>
            </tr>
            <tr>
                <td class="field-label">Current Treatment</td>
                <td>{{ ev.current_treatment }}</td>
                <td class="field-label">Context / Triggers</td>
                <td>{{ ev.triggers }}</td>
            </tr>
        </table>
        {% if ev.medications %}
        <table class="meds-table">
            <thead>
                <tr><th>Name</th><th>Dose</th><th>Unit</th><th>Time taken</th></tr>
            </thead>
            <tbody>
                {% for med in ev.medications %}
                <tr>
                    <td>{{ med.name }}</td>
                    <td>{{ med.dose }}</td>
                    <td>{{ med.unit }}</td>
                    <td>{{ med.time_taken }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <div class="none">Medications: none reported</div>
        {% endif %}
    </div>
    {% endfor %}
    {% endif %}

    {% if condition %}
    <h2>Condition Overview</h2>
    <p class="self-reported">Aggregated from self-reported entries; not a clinical assessment.</p>
    <table>
        <tr><td class="field-label">Condition</td><td>{{ condition.name }}</td></tr>
        <tr><td class="field-label">Date range covered</td><td>{{ condition.date_range }}</td></tr>
        <tr><td class="field-label">Number of events</td><td>{{ condition.event_count }}</td></tr>
        <tr><td class="field-label">Severity (self-reported, 1-10)</td><td>{{ condition.severity }}</td></tr>
        <tr><td class="field-label">Worst functional impact</td><td>{{ condition.worst_impact }}</td></tr>
        <tr><td class="field-label">Medications seen</td><td>{{ condition.unique_medications }}</td></tr>
        <tr><td class="field-label">Current Treatment(s)</td><td>{{ condition.current_treatments }}</td></tr>
        <tr><td class="field-label">Most-frequent triggers</td><td>{{ condition.top_triggers }}</td></tr>
    </table>
    {% endif %}

    <div class="footer-note">
        All information is self-reported by the patient and is provided for informational
        purposes only; it does not constitute a clinical diagnosis.
    </div>
</body>
</html>"""
)


# Public API for flask route and CLI usage

def build_report(
    *,
    title: str = "Health Diary Report",
    patient_name: Optional[str] = None,
    generated_at: Optional[datetime] = None,
    event_entries: Optional[list[Mapping]] = None,
    condition_entries: Optional[list[Mapping]] = None,
    condition_name: Optional[str] = None,
) -> bytes:
    """Render a one-page PDF and return its bytes.

    Args:
        title: Report title shown at the top of the page.
        patient_name: Optional patient name shown in the metadata line.
        generated_at: Generation timestamp; defaults to now (UTC).
        event_entries: Entries rendered in the Event Log section.
        condition_entries: Entries aggregated into the Condition Overview.
        condition_name: Optional explicit condition label for the overview.

    Returns:
        The rendered PDF as bytes.

    Raises:
        ValueError: If both event_entries and condition_entries are empty/None.
    """
    if not event_entries and not condition_entries:
        raise ValueError(
            "At least one of event_entries or condition_entries must be provided."
        )

    if generated_at is None:
        generated_at = datetime.now(timezone.utc)

    events = [_build_event_row(e) for e in (event_entries or [])]
    condition = (
        _aggregate_condition(list(condition_entries), condition_name)
        if condition_entries
        else None
    )

    html = _TEMPLATE.render(
        title=title,
        patient_name=patient_name,
        generated_at=_format_datetime(generated_at),
        events=events,
        condition=condition,
    )

 
    import weasyprint

    document = weasyprint.HTML(string=html).render()
    page_count = len(document.pages)
    if page_count > 1:
        logger.warning(
            "Generated PDF report spans %d pages; expected one page. "
            "Consider reducing the number of entries.",
            page_count,
        )

    return document.write_pdf()


def write_report(path: str, **kwargs) -> str:
    """Call build_report(**kwargs) and write the resulting bytes to `path`.

    Returns:
        The path written to.
    """
    pdf_bytes = build_report(**kwargs)
    with open(path, "wb") as fh:
        fh.write(pdf_bytes)
    return path



#Sample Data 
def _sample_entries():
    return [
        {
            "main_symptom": "Feeling wack",
            "event_datetime": "2026-05-20T14:30:00+00:00",
            "pain_level": 10,
            "mood": 1,
            "functional_impact": "moderate",
            "medications": [
                {
                    "name": "Drank",
                    "dosage": 400,
                    "unit": "beers",
                    "time_taken": "2026-05-20T15:00:00+00:00",
                },
                {"name": "A vegetable called kratom"},
            ],
            "current_treatment": "Jamilkous Squeegee bbq sauce",
            "triggers": ["No hoes", "Listening to eliot smith"],
            "notes": "Should not appear in the report.",
        },
        {
            "main_symptom": "migraine",
            "event_datetime": datetime(2026, 5, 22, 9, 5, tzinfo=timezone.utc),
            "pain_level": 9,
            "functional_impact": "severe",
            "medications": [
                {"name": "Sumatriptan", "dosage": 50, "unit": "mg"},
            ],
            "current_treatment": "Daily propranolol",
            "triggers": ["stress", "poor sleep"],
        },
        {
            "main_symptom": "migraine",
            "event_datetime": "2026-05-25T18:45:00Z",
            "pain_level": 4,
            "functional_impact": "mild",
            # No medications, no triggers, no current_treatment: tolerance test.
        },
    ]


def _main(argv: list[str]) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    if not argv or argv[0] != "sample":
        print("Usage: python -m src.pdf_export sample [out.pdf]", file=sys.stderr)
        return 2

    out_path = argv[1] if len(argv) > 1 else "health_report.pdf"
    entries = _sample_entries()
    write_report(
        out_path,
        title="Health Diary Report",
        patient_name="Jamilkous Squeegee",
        event_entries=entries,
        condition_entries=entries,
    )
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main(sys.argv[1:]))
