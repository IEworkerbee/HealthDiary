/*
Author: Dennis Hulett
Created: 5/28/2026
Last Edited: 6/1/2026

This is the settings page so the user can select which fields they want displayed
when creating a diary log entry. These settings persist across site visits.

*/

import { NavSideBar } from "../components/NavSideBar";
import { Form } from "react-bootstrap";
import { AVAILABLE_MODULES, type ModuleKey } from "../scripts/models";
import { useModulePreferences } from "../scripts/useModulePreferences";

const Settings = () => {
  const { isActive, toggle } = useModulePreferences(); //see usemodulepreferences.ts in scripts for how this works

  return (
    <>
      <NavSideBar />
      <div className="p-4">
        <h4>Diary Entry Fields</h4>
        <p className="text-muted">
          Choose which fields appear when logging an entry.
        </p>
        {AVAILABLE_MODULES.map(({ key, label }) => (
          <Form.Check
            key={key} //key as per available modules
            type="switch" //it's a switch
            id={`module-${key}`} //module-[key] so id's stay uniform
            label={label} //label as per available modules
            checked={isActive(key as ModuleKey)} //displays whether switch is on by default
            onChange={() => toggle(key as ModuleKey)} //toggles switch on/off
          />
        ))}
      </div>
    </>
  );
};

export default Settings;
