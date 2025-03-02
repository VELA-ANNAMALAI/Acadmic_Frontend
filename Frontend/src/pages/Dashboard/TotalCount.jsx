import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const TotalCount = () => {
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get('https://academic-backend-5azj.onrender.com/apicount/counts');
        setCounts(response.data);
      } catch (err) {
        setError("Error fetching counts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <Row className="mb-4">
        <Col xs={6} md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Students</Card.Title>
              <Card.Text>{counts.totalStudents}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Faculty</Card.Title>
              <Card.Text>{counts.totalFaculty}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Courses</Card.Title>
              <Card.Text>0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Upcoming Events</Card.Title>
              <Card.Text>{counts.upcomingEvents}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TotalCount;