import { Container, Row, Col, Card, Alert } from "react-bootstrap";

interface HumanDiagramProps {
  selectedLocations: string[];
  onLocationToggle: (index: string) => void;
}

export const HumanDiagram = ({
  selectedLocations,
  onLocationToggle,
}: HumanDiagramProps) => {
  const ellipseData = [
    {
      id: "head",
      transform: "translate(118.516748126737, 12.0016960128341)",
      rx: "64.5091160689832",
      ry: "59.2583740633683",
      cx: "64.5091160689832",
      cy: "59.2583740633683",
    },
    {
      id: "belly",
      transform: "translate(138.019504147592, 210.779786225399)",
      rx: "45.0063600481278",
      ry: "26.6287630284756",
      cx: "45.0063600481278",
      cy: "26.6287630284756",
    },
    {
      id: "upperrightarm",
      transform: "translate(231.782754247858, 144.770458154811)",
      rx: "36.0050880385023",
      ry: "18.7526500200533",
      cx: "36.0050880385023",
      cy: "18.7526500200533",
    },
    {
      id: "lowerrightarm",
      transform: "translate(294.791658315237, 166.523532178073)",
      rx: "13.1268550140373",
      ry: "39.3805650421119",
      cx: "13.1268550140373",
      cy: "39.3805650421119",
    },
    {
      id: "righthand",
      transform: "translate(283.540068303205, 246.784874263901)",
      rx: "22.1281270236628",
      ry: "20.6279150220586",
      cx: "22.1281270236628",
      cy: "20.6279150220586",
    },
    {
      id: "upperleftarm",
      transform: "translate(69.7598580745981, 150.771306161228)",
      rx: "30.7543460328873",
      ry: "16.8773850180479",
      cx: "30.7543460328873",
      cy: "16.8773850180479",
    },
    {
      id: "lowerleftarm",
      transform: "translate(45.75646604893, 174.774698186896)",
      rx: "19.1277030204543",
      ry: "35.2549820377001",
      cx: "19.1277030204543",
      cy: "35.2549820377001",
    },
    {
      id: "lefthand",
      transform: "translate(48.7568900521385, 245.284662262297)",
      rx: "19.8778090212565",
      ry: "18.7526500200533",
      cx: "19.8778090212565",
      cy: "18.7526500200533",
    },
    {
      id: "upperleftleg",
      transform: "translate(136.519292145988, 259.536676277537)",
      rx: "11.626643012433",
      ry: "35.2549820377001",
      cx: "11.626643012433",
      cy: "35.2549820377001",
    },
    {
      id: "lowerleftleg",
      transform: "translate(131.268550140373, 330.046640352937)",
      rx: "17.252438018449",
      ry: "33.7547700360959",
      cx: "17.252438018449",
      cy: "33.7547700360959",
    },
    {
      id: "leftfoot",
      transform: "translate(86.262190092245, 389.305014416306)",
      rx: "32.2545580344916",
      ry: "18.0025440192511",
      cx: "32.2545580344916",
      cy: "18.0025440192511",
    },
    {
      id: "upperrightleg",
      transform: "translate(202.528620216575, 259.536676277537)",
      rx: "14.2520140152405",
      ry: "37.8803530405076",
      cx: "14.2520140152405",
      cy: "37.8803530405076",
    },
    {
      id: "lowerrightleg",
      transform: "translate(204.778938218982, 336.047488359354)",
      rx: "12.3767490132351",
      ry: "27.7539220296788",
      cx: "12.3767490132351",
      cy: "27.7539220296788",
    },
    {
      id: "rightfoot",
      transform: "translate(213.780210228607, 383.304166409889)",
      rx: "33.3797170356948",
      ry: "18.0025440192511",
      cx: "33.3797170356948",
      cy: "18.0025440192511",
    },
    {
      id: "chest",
      transform: "translate(133.518868142779, 133.518868142779)",
      rx: "49.1319430525395",
      ry: "37.1302470397055",
      cx: "49.1319430525395",
      cy: "37.1302470397055",
    },
  ];

  return (
    <Container>
      <Row>
        <Col md={8}>
          <Card className="p-3 shadow-sm">
            <svg
              className="svgvector"
              style={{ height: "auto" }}
              viewBox="0 0 375.053 441.812"
            >
              {ellipseData.map((val, index) => {
                return (
                  <ellipse
                    key={index}
                    id={val.id}
                    transform={val.transform}
                    rx={val.rx}
                    ry={val.ry}
                    cx={val.cx}
                    cy={val.cy}
                    fill={
                      selectedLocations.includes(val.id) ? "#FF0000" : "#99d9ea"
                    }
                    fillRule="evenodd"
                    stroke="#3f48cc"
                    strokeWidth="3.75053000401065"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                    onClick={() => onLocationToggle(val.id)}
                  />
                );
              })}
            </svg>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Selected Regions</Card.Title>
              {selectedLocations.length > 0 ? (
                <Alert variant="success">{selectedLocations.join(", ")}</Alert>
              ) : (
                <Alert variant="secondary">Click a region to select it.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
