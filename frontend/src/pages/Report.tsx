import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { NavSideBar } from "../components/NavSideBar";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

interface PagePasser {
  numPages: number;
}

export default function Report() {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const pdfFile = "/test.pdf";

  function onDocumentLoadSuccess({ numPages }: PagePasser) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message || "Failed to load PDF file.");
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  return (
    <>
      <NavSideBar />
      <Container className="my-4">
        <Row className="justify-content-center mb-4">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              {/* Toolbar Header */}
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={pageNumber <= 1}
                    onClick={() => changePage(-1)}
                    className="me-2"
                  >
                    <FaChevronLeft /> Prev
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={pageNumber >= numPages}
                    onClick={() => changePage(1)}
                  >
                    Next <FaChevronRight />
                  </Button>
                </div>
                <span className="text-muted small">
                  Page {pageNumber} of {numPages || "..."}
                </span>
              </Card.Header>

              {/* Viewer Body */}
              <Card.Body
                className="d-flex justify-content-center p-3 bg-dark-subtle overflow-auto"
                style={{ maxHeight: "75vh" }}
              >
                {error && (
                  <Alert variant="danger" className="w-100 m-0">
                    {error}
                  </Alert>
                )}

                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="text-center my-4">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Loading PDF...</p>
                    </div>
                  }
                >
                  {/* Responsive canvas sizing via standard device pixel ratios */}
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow"
                  />
                </Document>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center mb-4">
          <Col xs={4} md={3}>
            <Button
              as="a"
              href="/test.pdf"
              download="My_Downloaded_File.pdf"
              variant="primary"
            >
              Download PDF
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}
