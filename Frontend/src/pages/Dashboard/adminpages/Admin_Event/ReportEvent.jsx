import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Alert, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import AdminSidebar from "../Admin_sidebar/AdminSidebar";

const AdminReportEvent = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/apievent/events`);
        setEvents(response.data);
      } catch (err) {
        console.error(err);
        setError("Error fetching events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
        const uniqueDepartments = [...new Set(response.data.map(degree => degree.department))];
        setDepartments(uniqueDepartments);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    fetchEvents();
    fetchDepartments();
  }, []);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (events.length === 0) return <Alert variant="info">No events available.</Alert>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter events based on the selected date range and department
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const isWithinDateRange = (!startDate || eventDate >= start) && (!endDate || eventDate <= end);
    const isDepartmentMatch = !selectedDepartment || event.department === selectedDepartment;
    return isWithinDateRange && isDepartmentMatch;
  });

  const handleViewDetails = (eventId) => {
    navigate(`/Adminevent/${eventId}`);
  };

  // Function to generate PDF
  const downloadPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("All Events Report", 14, 10);
      
      // Prepare data for the table
      const tableData = filteredEvents.map((event, index) => [
        index + 1, // Serial number
        event.eventName,
        event.department,
        event.resourcePersonName,
        formatDate(event.date), // Use the formatDate function
        event.time,
        event.venue,
        event.organizerName
      ]);
  
      // Add the table to the PDF
      doc.autoTable ({
        head: [['S.No', 'Event Name', 'Department', 'Resource Person', 'Date', 'Time', 'Venue', 'Organizer']],
        body: tableData,
        startY: 20,
      });
  
      // Save the PDF
      doc.save("events_report.pdf");
    };

  return (
    <Container>
    <Row>
      <Col xs={2} className="sidebar">
        <AdminSidebar />
      </Col>
      <Col xs={10}>
                <h2 className="mb-4 text-center">All Events Report</h2>
      
                {/* Date Range Filter and Department Filter */}
                <Row className="mb-4">
                  <Col md={4}>
                    <Form.Group controlId="formDepartment">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formStartDate">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formEndDate">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col md={2} className="d-flex align-items-end">
                    <Button variant="primary" onClick={downloadPDF}>
                      Download as PDF
                    </Button>
                  </Col>
                </Row>
      
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Event Name</th>
                        <th>Department</th>
                        <th>Resource Person</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Venue</th>
                        <th>Organizer</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event, index) => (
                        <tr key={event._id}>
                          <td>{index + 1}</td>
                          <td>{event.eventName}</td>
                          <td>{event.department}</td>
                          <td>{event.resourcePersonName}</td>
                          <td>{formatDate(event.date)}</td>
                          <td>{event.time}</td>
                          <td>{event.venue}</td>
                          <td>{event.organizerName}</td>
                          <td>
                            <Button variant="info" onClick={() => handleViewDetails(event._id)}>View Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
    </Row>
  </Container>
  );
};

export default AdminReportEvent;
