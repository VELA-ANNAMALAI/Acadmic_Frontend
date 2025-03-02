import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Admin_sidebar/AdminSidebar';

export default function AdminAcademic_Course() {
  const [searchParams, setSearchParams] = useState({
    department: '',
    courseType: '',
    course: '',
  });

  const [academicYear, setAcademicYear] = useState('');
  const [departments, setDepartments] = useState([]);
  const [courseTypes] = useState(['UG', 'PG']);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ academicYear: '', courseName: '', semesters: [] });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({ semesters: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`);
      setDepartments([...new Set(response.data.map(degree => degree.department))]);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  useEffect(() => {
    if (searchParams.department) {
      fetchCourses(searchParams.department);
    }
  }, [searchParams.department]);

  const fetchCourses = async (department) => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/apicourses/fetchcourse/${department}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchFilteredCourses = async (department, courseType) => {
    if (department && courseType) {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees/courses`, {
          params: { department, courseType }
        });
        setFilteredCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedParams = { ...searchParams, [name]: value.toUpperCase() };
    setSearchParams(updatedParams);

    if (name === "department") {
      fetchFilteredCourses(updatedParams.department, updatedParams.courseType);
    }
  };

  const handleCourseTypeChange = (type) => {
    const updatedParams = { ...searchParams, courseType: type };
    setSearchParams(updatedParams);

    fetchFilteredCourses(updatedParams.department, type);

    const semesterCount = type === 'UG' ? 6 : 4;
    const semestersArray = Array.from({ length: semesterCount }, (_, i) => ({
      semester: i + 1,
      semesterName: `Semester ${i + 1}`,
      subjects: []
    }));
    setNewCourse({ academicYear: '', courseName: '', semesters: semestersArray });
  };

  const handleSubjectChange = (semesterIndex, subjectIndex, field, value) => {
    setNewCourse((prev) => {
      const updatedSemesters = [...prev.semesters];
      updatedSemesters[semesterIndex].subjects[subjectIndex] = {
        ...updatedSemesters[semesterIndex].subjects[subjectIndex],
        [field]: value.toUpperCase()
      };
      return { ...prev, semesters: updatedSemesters };
    });
  };

  const addSubjectRow = (semesterIndex) => {
    setNewCourse((prev) => {
      const updatedSemesters = [...prev.semesters];
      updatedSemesters[semesterIndex].subjects.push({ subCode: '', title: '' });
      return { ...prev, semesters: updatedSemesters };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCourse.courseName) {
      alert('Course name is required.');
      return;
    }

    try {
      await axios.post(`https://academic-backend-5azj.onrender.com/apicourses/addcourse/${searchParams.department}`, {
        academicYear: newCourse.academicYear,
        courseName: newCourse.courseName,
        semesters: newCourse.semesters
      });
      alert('Course added successfully!');
      setNewCourse({ academicYear: '', courseName: '', semesters: [] });
      fetchCourses(searchParams.department);
    } catch (error) {
      console.error('Error adding course:', error.response.data);
      alert('Failed to add course. Please try again.');
    }
  };

  const viewCourseDetails = (course) => {
    setSelectedCourse({
      ...course,
      semesters: Array.isArray(course.semesters) ? course.semesters : []
    });
    setShowViewModal(true);
  };

  const updateCourse = (course) => {
    setSelectedCourse({
      ...course,
      semesters: Array.isArray(course.semesters) ? course.semesters : []
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://academic-backend-5azj.onrender.com/apicourses/updatecourse/${selectedCourse._id}`, selectedCourse);
      alert('Course updated successfully!');
      setShowUpdateModal(false);
      fetchCourses(searchParams.department);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`https://academic-backend-5azj.onrender.com/apicourses/deletecourse/${courseId}`);
        alert('Course deleted successfully!');
        fetchCourses(searchParams.department);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <Row>
        <Col xs={2} className="sidebar">
          <AdminSidebar />
        </Col>
        <Col xs={10}>
          <h1 className="text-center mb-4">Academic Course Management</h1>
          <div className="mb-4">
            <div className="row">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Department:</Form.Label>
                  <Form.Control as="select" name="department" value={searchParams.department} onChange={handleInputChange}>
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Course Type:</Form.Label>
                  <Form.Control as="select" name="courseType" value={searchParams.courseType} onChange={(e) => handleCourseTypeChange(e.target.value)}>
                    <option value="">Select Course Type</option>
                    {courseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Course:</Form.Label>
                  <Form.Control 
                    as="select" 
                    name="course" 
                    value={searchParams.course} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Course</option>
                    {filteredCourses.map(course => (
                      <option key={course.courseName} value={course.courseName}>
                        {course.courseName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
            </div>
          </div>

          <h3 className="mb-3">Add Course</h3>
          <form onSubmit={handleSubmit}>
       <div className="mb-3">
  <label className="form-label">Academic Year:</label>
  <input 
    type="text" 
    className="form-control" 
    value={academicYear} 
    onChange={(e) => setAcademicYear(e.target.value)} // Allow typing
  />
</div>

            <div className="mb-3">
              <label className="form-label">Course Name:</label>
              <input type="text" className="form-control" name="courseName" value={newCourse.courseName} onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })} />
            </div>

            <h4 className="mb-3">Subjects</h4>
            {newCourse.semesters.map((semester, semesterIndex) => (
              <div key={semesterIndex} className="mb-4">
                <h5>{semester.semesterName}</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.subjects.map((subject, subjectIndex) => (
                      <tr key={subjectIndex}>
                        <td>
                          <input type="text" className="form-control" value={subject.subCode} onChange={(e) => handleSubjectChange(semesterIndex, subjectIndex, 'subCode', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control" value={subject.title} onChange={(e) => handleSubjectChange(semesterIndex, subjectIndex, 'title', e.target.value)} />
                        </td>
                        <td>
                          {/* Conditionally render the delete button */}
                          {(subject.subCode === '' && subject.title === '') && (
                            <Button type="button" className="btn btn-danger" onClick={() => {
                              const updatedSubjects = semester.subjects.filter((_, i) => i !== subjectIndex);
                              const updatedSemesters = [...newCourse.semesters];
                              updatedSemesters[semesterIndex].subjects = updatedSubjects;
                              setNewCourse((prev) => ({ ...prev, semesters: updatedSemesters }));
                            }}>
                              Delete Subject
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button type="button" className="btn btn-primary mb-3" onClick={() => addSubjectRow(semesterIndex)}>Add Subject</Button>
              </div>
            ))}

            <Button type="submit" className="btn btn-success">Save Course</Button>
          </form>

          <h3 className="mt-5 mb-3">Existing Courses</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Academic Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseName}</td>
                  <td>{course.academicYear}</td>
                  <td>
                    <Button className="btn btn-info" onClick={() => viewCourseDetails(course)}>View</Button>
                    <Button className="btn btn-warning" onClick={() => updateCourse(course)}>Update</Button>
                    <Button className="btn btn-danger" onClick={() => deleteCourse(course._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for Viewing Course Details */}
          <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Course Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedCourse && (
                <>
                  <p><strong>Course Name:</strong> {selectedCourse.courseName}</p>
                  <p><strong>Academic Year:</strong> {selectedCourse.academicYear}</p>
                  <h5>Subjects</h5>
                  {Array.isArray(selectedCourse.semesters) && selectedCourse.semesters.map((sem, index) => (
                    <div key={index}>
                      <h6>{sem.semesterName}</h6>
                      <ul>
                        {Array.isArray(sem.subjects) && sem.subjects.map((subject, subIndex) => (
                          <li key={subIndex}>{subject.subCode}: {subject.title}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal for Updating Course */}
          <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Course</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedCourse && (
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Course Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCourse.courseName || ''}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, courseName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Academic Year:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCourse.academicYear || ''}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, academicYear: e.target.value })}
                    />
                  </div>

                  <h5>Subjects</h5>
                  {Array.isArray(selectedCourse.semesters) && selectedCourse.semesters.map((sem, semesterIndex) => (
                    <div key={semesterIndex}>
                      <h6>{sem.semesterName}</h6>
                      <ul>
                        {Array.isArray(sem.subjects) && sem.subjects.map((subject, subjectIndex) => (
                          <li key={subjectIndex}>
                            <input
                              type="text"
                              className="form-control mb-2"
                              placeholder="Subject Code"
                              value={subject.subCode}
                              onChange={(e) => {
                                const updatedSubjects = [...selectedCourse.semesters[semesterIndex].subjects];
                                updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], subCode: e.target.value };
                                setSelectedCourse((prev) => {
                                  const updatedSemesters = [...prev.semesters];
                                  updatedSemesters[semesterIndex].subjects = updatedSubjects;
                                  return { ...prev, semesters: updatedSemesters };
                                });
                              }}
                            />
                            <input
                              type="text"
                              className="form-control mb-2"
                              placeholder="Subject Title"
                              value={subject.title}
                              onChange={(e) => {
                                const updatedSubjects = [...selectedCourse.semesters[semesterIndex].subjects];
                                updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], title: e.target.value };
                                setSelectedCourse((prev) => {
                                  const updatedSemesters = [...prev.semesters];
                                  updatedSemesters[semesterIndex].subjects = updatedSubjects;
                                  return { ...prev, semesters: updatedSemesters };
                                });
                              }}
                            />
                            {/* Conditionally render the delete button */}
                            {(subject.subCode === '' && subject.title === '') && (
                              <Button type="button" className="btn btn-danger" onClick={() => {
                                const updatedSubjects = sem.subjects.filter((_, i) => i !== subjectIndex);
                                const updatedSemesters = [...selectedCourse.semesters];
                                updatedSemesters[semesterIndex].subjects = updatedSubjects;
                                setSelectedCourse((prev) => ({ ...prev, semesters: updatedSemesters }));
                              }}>
                                Delete Subject
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                      <Button type="button" className="btn btn-primary mb-3" onClick={() => {
                        const updatedSubjects = [...selectedCourse.semesters[semesterIndex].subjects];
                        updatedSubjects.push({ subCode: '', title: '' });
                        setSelectedCourse((prev) => {
                          const updatedSemesters = [...prev.semesters];
                          updatedSemesters[semesterIndex].subjects = updatedSubjects;
                          return { ...prev, semesters: updatedSemesters };
                        });
                      }}>Add Subject</Button>
                    </div>
                  ))}

                  <Button type="submit" className="btn btn-success">Update Course</Button>
                </form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

        </Col>
      </Row>
    </div>
  );
}
