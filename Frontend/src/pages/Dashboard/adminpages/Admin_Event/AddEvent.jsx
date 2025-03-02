import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import axios from "axios";
import AdminSidebar from "../Admin_sidebar/AdminSidebar";

const AdminAddEvent = () => {
  document.body.style.backgroundColor = "linear-gradient(90deg, rgba(214,169,230,0.9193802521008403) 23%, rgba(207,242,242,0.6812850140056023) 72%)"; // Full-page blue background

  const [eventData, setEventData] = useState({
    eventName: "",
    department: "",
    date: "",
    time: "",
    venue: "",
    resourcePersonName: "",
    resourcePersonBackground: "",
    organizerName: "",
    participation: "",
    description: "",
    flyer: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);

  useEffect(() => {
    fetchDegrees(); // Call fetchDegrees to populate uniqueDepartments
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
      // Extract unique departments from the degrees
      const departments = [...new Set(response.data.map(degree => degree.department))];
      setUniqueDepartments(departments);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const handleFileChange = (e) => {
    setEventData({ ...eventData, flyer: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    for (const key in eventData) {
      formData.append(key, eventData[key]);
    }
    try {
      const response = await axios.post(
        `https://academic-backend-5azj.onrender.com/apievent/events`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        setEventData({
          eventName: "",
          department: "",
          date: "",
          time: "",
          venue: "",
          resourcePersonName: "",
          resourcePersonBackground: "",
          organizerName: "",
          participation: "",
          description: "",
          flyer: null,
        });
      }
    } catch (err) {
      setError("An error occurred while adding the event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
    <Row>
      <Col xs={2} className="sidebar">
        <AdminSidebar/>
      </Col>
      <Col xs={10}>
        <h2 className="mb-4 text-center text-primary">Add New Event</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Event added successfully!</Alert>}
        <Card className="shadow-lg border-0 rounded">
          <Card.Body className="p-5">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="eventName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="eventName"
                      value={eventData.eventName}
                      onChange={handleChange}
                      placeholder="Enter event name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="department" className="mt-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      as="select"
                      name="department"
                      value={eventData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {uniqueDepartments.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="date" className="mt-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={eventData.date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="time" className="mt-3">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={eventData.time}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="venue" className="mt-3">
                    <Form.Label>Venue</Form.Label>
                    <Form.Control
                      as="select"
                      name="venue"
                      value={eventData.venue}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Venue</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Conference Room">Conference Room</option>
                      <option value="Online">Online</option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="resourcePersonName">
                    <Form.Label>Resource Person Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="resourcePersonName"
                      value={eventData.resourcePersonName}
                      onChange={handleChange}
                      placeholder="Enter resource person name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="resourcePersonBackground" className="mt-3">
                    <Form.Label>Resource Person Background</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="resourcePersonBackground"
                      value={eventData.resourcePersonBackground}
                      onChange={handleChange}
                      placeholder="Enter background details"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="organizerName" className="mt-3">
                    <Form.Label>Organizer Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="organizerName"
                      value={eventData.organizerName}
                      onChange={handleChange}
                      placeholder="Enter organizer name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="participation" className="mt-3">
                    <Form.Label>Participation</Form.Label>
                    <Form.Control
                      type="text"
                      name="participation"
                      value={eventData.participation}
                      onChange={handleChange}
                      placeholder="Enter participation details"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="description" className="mt-3">
                    <Form.Label>Event Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={eventData.description}
                      onChange={handleChange}
                      placeholder="Enter event description"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="flyer" className="mt-3">
                    <Form .Label>Flyer (optional)</Form.Label>
                    <Form.Control type="file" name="flyer" onChange={handleFileChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                type="submit"
                className="w-90 mt-4 btn-lg"
                variant="btn btn-secondary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Event"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
  );
};

export default AdminAddEvent;