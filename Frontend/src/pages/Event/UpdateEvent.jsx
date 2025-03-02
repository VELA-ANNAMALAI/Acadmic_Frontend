import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const UpdateEvent = () => {
  const { eventId } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}`);
        setEventData(response.data);
      } catch (err) {
        setError("Error fetching event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
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
      const response = await axios.put(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/event/${eventId}`); // Redirect to event details page after successful update
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred while updating the event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-5">
      <Row>
        <Col xs={12}>
          <h2 className="mb-4 text-center">Update Event</h2>
          {success && <Alert variant="success">Event updated successfully!</Alert>}
          <Form onSubmit={handleSubmit}>
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
                <option value="COMPUTER SCIENCE">COMPUTER SCIENCE</option>
                <option value="ELECTRONICS">ELECTRONICS</option>
                <option value="MECHANICAL">MECHANICAL</option>
                {/* Add more departments as needed */}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="date" className="mt-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={eventData.date.split("T")[0]} // Format date for input
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
                <option value="Conference Room">Conference Room</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Online">Online</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="resourcePersonName" className="mt-3">
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
              <Form.Label>Flyer (optional)</Form.Label>
              <Form.Control type="file" name="flyer" onChange={handleFileChange} />
            </Form.Group>
            <Button
              type="submit"
              className="w-100 mt-4"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateEvent;