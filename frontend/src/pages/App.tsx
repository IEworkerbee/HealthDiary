import { NavSideBar } from "../components/NavSideBar";
import { Button, Container } from "react-bootstrap";

function App() {
  return (
    <>
      <NavSideBar />
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "75vh" }}
      >
        <Button
          className="d-inline-flex align-items-center justify-content-center p-0"
          style={{ width: "12vw", aspectRatio: "1/1" }}
          href="/logentry"
        >
          <h2>Make a Diary Entry!</h2>
        </Button>
      </Container>
    </>
  );
}

export default App;
