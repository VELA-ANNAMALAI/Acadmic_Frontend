import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Alert, Button, Table, Row, Col, Form } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx"; // Import the FacultySidebar
import { useLocation } from "react-router-dom";

const EventDetails = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const staffId = queryParams.get("staffId");
  const facultyName = queryParams.get("facultyName");  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [includeFlyer, setIncludeFlyer] = useState(false); // State for checkbox
  const [isEditing, setIsEditing] = useState(false); // State for editing mode
  const [formData, setFormData] = useState({}); // State for form data
  const navigate = useNavigate();
 // Debugging
  console.log("Faculty Name:", facultyName); // Debugging
  console.log("Staff ID:", staffId); // Debugging
  
  // State for sidebar menu
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);
 
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}`);
        setEvent(response.data);
        setFormData(response.data); // Initialize form data with event details
      } catch (err) {
        setError("Error fetching event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Event Details", 14, 22);

    // Add a table with event details
    doc.autoTable({
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['Event Name', event.eventName],
        ['Department', event.department],
        ['Resource Person Name', event.resourcePersonName],
        ['Resource Person Background', event.resourcePersonBackground],
        ['Description', event.description],
        ['Date', formatDate(event.date)],
        ['Time', event.time],
        ['Venue', event.venue],
        ['Organizer', event.organizerName],
        ['Participation', event.participation],
      ],
    });

    // Include flyer if checkbox is checked
    if (includeFlyer && event.flyer) {
      doc.addPage();
      doc.text("Event Flyer", 14, 22);
      doc.addImage(`https://academic-backend-5azj.onrender.com/${event.flyer}`, 'JPEG', 14, 30, 180, 160); // Adjust dimensions as needed
    }

    // Save the PDF
    doc.save(`${event.eventName}_Details.pdf`);
  };

  const toggleMenu = (menu) => {
    switch (menu) {
      case 'students':
        setStudentsMenuOpen(!studentsMenuOpen);
        break;
      case 'faculty':
        setFacultyMenuOpen(!facultyMenuOpen);
        break;
      case 'studentAttendance':
        setStudentAttendance(!studentAttendance);
        break;
      case 'addEvent':
        setAddEvent(!addEvent);
        break;
      default:
        break;
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      console.log(formData)
      await axios.put(`https://academic-backend-5azj.onrender.com/apievent/updateevents/${eventId}`, formData);
      setEvent(formData);
      setIsEditing(false);
    } catch (err) {
      setError("Error updating event. Please try again.");
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}`);
        navigate("/events"); // Redirect to events list after deletion
      } catch (err) {
        setError("Error deleting event. Please try again.");
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("flyer", file);
    console.log("Selected file:", file); // Log the selected file

    try {
        await axios.put(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}/upload-flyer`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        setEvent({ ...event, flyer: file.name }); // Update event state with new flyer name
        window.location.reload();
      } catch (err) {
        console.error("Error uploading flyer:", err); // Log the error
        setError("Error uploading flyer. Please try again.");
    }
};
  const handleDeleteFlyer = async () => {
    if (window.confirm("Are you sure you want to delete the flyer?")) {
      try {
        await axios.delete(`https://academic-backend-5azj.onrender.com/apievent/events/${eventId}/delete-flyer`);
        setEvent({ ...event, flyer: null }); // Remove flyer from event state
      } catch (err) {
        setError("Error deleting flyer. Please try again.");
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col xs={2} className="sidebar">
          <FacultySidebar 
            studentsMenuOpen={studentsMenuOpen} 
            studentAttendance={studentAttendance} 
            addEvent={addEvent} 
            toggleMenu={toggleMenu} 
            staffId={staffId} 
            facultyName={facultyName}
          />
        </Col>
        <Col xs={10}>
          <h2 className="mb-4 text-center">Event Detail</h2>
          <Card>
            <Card.Body>
              {isEditing ? (
                <Form onSubmit={handleUpdateEvent}>
                  <Form.Group controlId="formEventName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="eventName" 
                      value={formData.eventName} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Form.Group controlId="formDepartment">
                    <Form.Label>Department</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Form.Group controlId="formResourcePersonName">
                    <Form.Label>Resource Person Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="resourcePersonName" 
                      value={formData.resourcePersonName} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Form.Group controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Form.Group controlId="formDate">
      <Form.Label>Date</Form.Label>
      <Form.Control 
        type="date" 
        name="date" 
        value={formData.date.split('T')[0]} // Format date for input
        onChange={handleInputChange} 
      />
    </Form.Group>
    <Form.Group controlId="formTime">
      <Form.Label>Time</Form.Label>
      <Form.Control 
        type="time" 
        name="time" 
        value={formData.time} 
        onChange={handleInputChange} 
      />
    </Form.Group>
    <Form.Group controlId="formVenue">
      <Form.Label>Venue</Form.Label>
      <Form.Control 
        type="text" 
        name="venue" 
        value={formData.venue} 
        onChange={handleInputChange} 
      />
    </Form.Group>
    <Form.Group controlId="formOrganizerName">
      <Form.Label>Organizer</Form.Label>
      <Form.Control 
        type="text" 
        name="organizerName" 
        value={formData.organizerName} 
        onChange={handleInputChange} 
      />
    </Form.Group>
    <Form.Group controlId="formParticipation">
      <Form.Label>Participation</Form.Label>
      <Form.Control 
        type="text" 
        name="participation" 
        value={formData.participation} 
        onChange={handleInputChange} 
      />
    </Form.Group>
                  <Button variant="success" type="submit">Update Event</Button>
                  <Button variant="secondary" onClick={handleEditToggle} className="ms-2">Cancel</Button>
                </Form>
              ) : (
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td><strong>Department :</strong></td>
                      <td>{event.department}</td>
                    </tr>
                    <tr>
                      <td><strong>Event Name:</strong></td>
                      <td>{event.eventName}</td>
                    </tr>
                    <tr>
                      <td><strong>Resource Person:</strong></td>
                      <td>{event.resourcePersonName}</td>
                    </tr>
                    <tr>
                      <td><strong>Resource Person Background:</strong></td>
                      <td>{event.resourcePersonBackground}</td>
                    </tr>
                    <tr>
 <td><strong>Description:</strong></td>
                      <td>{event.description}</td>
                    </tr>
                    <tr>
                      <td><strong>Date:</strong></td>
                      <td>{formatDate(event.date)}</td>
                    </tr>
                    <tr>
                      <td><strong>Time:</strong></td>
                      <td>{event.time}</td>
                    </tr>
                    <tr>
                      <td><strong>Venue:</strong></td>
                      <td>{event.venue}</td>
                    </tr>
                    <tr>
                      <td><strong>Organizer:</strong></td>
                      <td>{event.organizerName}</td>
                    </tr>
                    <tr>
                      <td><strong>Participation:</strong></td>
                      <td>{event.participation}</td>
                    </tr>
                  </tbody>
                </Table>
              )}
              {/* Display the flyer */}
              {event.flyer && (
                <div>
                  <strong>Event Flyer:</strong>
                  <div className="mt-4">
                    <img 
                      src={`https://academic-backend-5azj.onrender.com/${event.flyer}`} 
                      alt="Event Flyer" 
                      style={{ width: '100%', maxWidth: '600px', height: 'auto' }} 
                    />
                  </div>
                       <Button variant="danger" onClick={handleDeleteFlyer} className="mt-2">Delete Flyer</Button>
                     </div>
              )}
              <div className="mt-3">
                <input 
                  type="checkbox" 
                  id="includeFlyer" 
                  checked={includeFlyer} 
                  onChange={() => setIncludeFlyer(!includeFlyer)} 
                  disabled={!event.flyer} // Disable if flyer is not available
                />
                <label htmlFor="includeFlyer" className="ms-2">Include Flyer in PDF</label>
              </div>
              <Button variant="primary" onClick={() => window.history.back()}>Back to Events</Button>
              <Button variant="success" onClick={downloadPDF} className="ms-2">Download as PDF</Button>
              <Button variant="warning" onClick={handleEditToggle} className="ms-2">{isEditing ? "Cancel" : "Edit Event"}</Button>
              <Button variant="danger" onClick={handleDeleteEvent} className="ms-2">Delete Event</Button>
              <Form.Group controlId="formFileUpload" className="mt-3">
                <Form.Label>Upload New Flyer</Form.Label>
                <Form.Control type="file" onChange={handleFileUpload} />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetails;
