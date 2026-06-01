import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import logo from "../assets/temp_logo.png";
import { Link } from "react-router";

export function NavSideBar() {
  return (
    <>
      <Navbar key="md" expand="md" className="bg-body-tertiary mb-3">
        <Container fluid className="nav-container">
          <Navbar.Brand as={Link} to="/">
            <img src={logo} alt="Logo" width="80" height="80"></img>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-$"md"`} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-$"md"`}
            aria-labelledby={`offcanvasNavbarLabel-expand-$"md"`}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-$"md"`}>
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/calendar">Calendar</Nav.Link>
                <Nav.Link href="/diary">Diary</Nav.Link>
                <Nav.Link href="/settings">Settings</Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}
