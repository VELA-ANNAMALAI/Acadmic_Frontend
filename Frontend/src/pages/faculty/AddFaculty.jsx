import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios'; 
import { Country, State, City } from 'country-state-city';
import AdminSidebar from "../Dashboard/adminpages/Admin_sidebar/AdminSidebar";

const AddStaffForm = () => {
  const [facultyData, setFacultyData] = useState({
    name: "",
    bloodGroup: "",
    email: "",
    dob: "",
    gender: "",
    phone: "",
    designation: "",
    staffId: "",
    barcode: "",
    classIncharge: "NO", // Default to "NO"
    courseType: "",
    course: "",
    section: "",
    academicYear: "",
    experience: "",
    collegeName: "",
    aadharNumber: "",
    abcId: "",
    nationality: "",
    religion: "",
    community: "",
    doorNo: "",
    street: "",
    taluk: "",
    pincode: "",
    state: "",
    city: "",
    country: "",
    Qualification: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState([]);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const designations = ["ASSISTANT PROFESSOR", "ASSOCIATE PROFESSOR", "HOD", "DIRECTOR", "DEAN", "VICE PRINCIPAL", "COE", "DEPUTY COE", "PRINCIPAL"];
  const collegeOptions = ["VICAS", "VIAAS"];

  useEffect(() => {
    fetchCountries();
    fetchDegrees(); // Fetch degrees on component mount
  }, []);

  const fetchCountries = () => {
    const countryData = Country.getAllCountries();
    setCountries(countryData);
  };

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
      setDegrees(response.data);

      const departments = [...new Set(response.data.map(degree => degree.department))];
      const courseTypes = [...new Set(response.data.map(degree => degree.courseType))];
      setUniqueDepartments(departments);
      setUniqueCourseTypes(courseTypes);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const fetchCourses = async (department, courseType) => {
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
      setFilteredCourses([]); // Reset if department or courseType is not selected
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({
      ...prevData,
      [name]: value.toUpperCase(),
    }));

    if (name === "department" || name === "courseType") {
      fetchCourses(name === "department" ? value : facultyData.department, name === "courseType" ? value : facultyData.courseType);
    }

    // If country changes, reset state and city
    if (name === "country") {
      const stateData = State.getStatesOfCountry(value);
      setStates(stateData);
      setCities([]); // Reset cities
    }

    // If state changes, fetch cities
    if (name === "state") {
      const cityData = City.getCitiesOfState(facultyData.country, value);
      setCities(cityData);
    }

   

  };

  const handleClassInchargeChange = (e) => {
    const { value } = e.target;
    setFacultyData((prevData) => ({
      ...prevData,
      classIncharge: value,
    }));
  };

  const validateForm = async () => {
    const { email, phone, barcode, staffId, aadharNumber, abcId, experience } = facultyData;

    if (email) {
      const emailRegex = /^[a-z0-9._%+-]+@vicas\.org$/;
      if (!emailRegex.test(email)) {
        setError("Email must end with @vicas.org");
        return false;
      }
    }

    if (phone) {
      if (!/^[0-9]{10}$/.test(phone)) {
        alert("Phone number must be a 10-digit numeric value.");
        return false;
      }
    }

    if (barcode) {
      if (!/^[0-9]{10}$/.test(barcode)) {
        alert("Barcode must be exactly 10 digits.");
        return false;
      }
    }

    

    if (aadharNumber) {
      if (!/^[0-9]{12}$/.test(aadharNumber)) {
        setError("Aadhar number must be exactly 12 digits.");
        return false;
      }
    }

    if (abcId) {
      if (!/^[A-Z0-9]{12}$/.test(abcId)) {
        setError("ABC ID must be exactly 12 digits.");
        return false;
      }
    }

    if (experience) {
      if (!/^[0-9]{1,2}$/.test(experience) || experience > 99) {
        setError("Experience must be a maximum of 2 digits.");
        return false;
      }
    }

    try {
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/faculty/addfaculty/validate`, { email, staffId, barcode, phone });
      if (!response.data.isUnique) {
        setError(response.data.message);
        return false;
      }
    } catch (err) {
      setError("Validation failed. Ensure that Staff ID, Email, Barcode, and Phone number are unique.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    const formData = new FormData();
Object.entries(facultyData).forEach(([key, value]) => {
  formData.append(key, value);
});

    const payload = {
      name: facultyData.name,
      bloodGroup: facultyData.bloodGroup,
      email: facultyData.email,
      dob: facultyData.dob,
      gender: facultyData.gender,
      designation: facultyData.designation,
      courseType: facultyData.classIncharge === "YES" ? facultyData.courseType : null,
      department: facultyData.department,
      course: facultyData.classIncharge === "YES" ? facultyData.course : null,
      section: facultyData.classIncharge === "YES" ? facultyData.section : null,
      academicYear: facultyData.classIncharge === "YES" ? facultyData.academicYear : null,
      staffId: facultyData.staffId,
      barcode: facultyData.barcode,
      phone: facultyData.phone,
      classIncharge: facultyData.classIncharge,
      experience: facultyData.experience,
      collegeName: facultyData.collegeName,
      aadharNumber: facultyData.aadharNumber,
      abcId: facultyData.abcId,
      nationality: facultyData.nationality,
      religion: facultyData.religion,
      community: facultyData.community,
      doorNo: facultyData.doorNo,
      street: facultyData.street,
      taluk: facultyData.taluk,
      pincode: facultyData.pincode,
      state: facultyData.state,
      country: facultyData.country,
      city: facultyData.city,
      Qualification: facultyData.Qualification,
    };

    const disabledDesignations = ["DIRECTOR", "DEAN", "DEPUTY COE", "VICE PRINCIPAL", "PRINCIPAL"];
    if (disabledDesignations.includes(facultyData.designation)) {
      payload.department = "NO";
      payload.classIncharge = "NO";
    }

    console.log("Payload to submit:", payload);

    setLoading(true);
    try {
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/faculty/addfaculty`, payload);

      if (response.status === 200 || response.status === 201) {
        setFacultyData({
          name: "",
          bloodGroup: "",
          email: "",
          dob: "",
          gender: "",
          phone: "",
          designation: "",
          staffId: "",
          barcode: "",
          classIncharge: "NO", // Reset to default
          courseType: "",
          course: "",
          section: "",
          academicYear: "",
          experience: "",
          collegeName: "",
          aadharNumber: "",
          abcId: "",
          nationality: "",
          religion: "",
          community: "",
          doorNo: "",
          street: "",
          taluk: "",
          pincode: "",
          state: "",
          city: "",
          country: "",
          Qualification: "",
          department: "",
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      setError("An error occurred while adding the faculty. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container>
      <Row>
        <Col xs={2} className="sidebar">
          <AdminSidebar />
        </Col>
        <Col xs={10}>
          <h2 className="mb-4 text-center">Add New Faculty</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Data submitted successfully!</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={6} className="mb-4 ">
                <Form.Group controlId="name">
                  <Form.Label>Faculty Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={facultyData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="Qualification">
                  <Form.Label>Qualification</Form.Label>
                  <Form.Control
                    type="text"
                    name="Qualification"
                    value={facultyData.Qualification}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="bloodGroup">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Control
                    as="select"
                    name="bloodGroup"
                    value={facultyData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group, index) => (
                      <option key={index} value={group}>
                        {group}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control as="select" name="gender" value={facultyData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    {["FEMALE", "MALE"].map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={facultyData.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="dob">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="text"
                    name="dob"
                    value={facultyData.dob}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="phone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={facultyData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="collegeName">
                  <Form.Label>College Name</Form.Label>
                  <Form.Control
                    as="select"
                    name="collegeName"
                    value={facultyData.collegeName}
                    onChange={handleChange}
                  >
                    <option value="">Select College</option>
                    {collegeOptions.map((college, index) => (
                      <option key={index} value={college}>
                        {college}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col lg={6} className="mb-4">
                <Form.Group controlId="designation">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    as="select"
                    name="designation"
                    value={facultyData.designation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Designation</option>
                    {designations.map((designation, index) => (
                      <option key={index} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="experience">
                  <Form.Label>Experience (in years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    value={facultyData.experience}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="staffId">
                  <Form.Label>Staff ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="staffId"
                    value={facultyData.staffId}
                    onChange={handleChange} required
                  />
                </Form.Group>

                <Form.Group controlId="barcode">
                  <Form.Label>Barcode</Form.Label>
                  <Form.Control
                    type="text"
                    name="barcode"
                    value={facultyData.barcode}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="aadharNumber">
                  <Form.Label>Aadhar Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadharNumber"
                    value={facultyData.aadharNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="abcId">
                  <Form.Label>ABC ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="abcId"
                    value={facultyData.abcId}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="department">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    as="select"
                    name="department"
                    value={facultyData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {uniqueDepartments.map((department, index) => (
                      <option key={index} value={department}>
                        {department}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="classIncharge">
                  <Form.Label>Class Incharge</Form.Label>
                  <Form.Control
                    as="select"
                    name="classIncharge"
                    value={facultyData.classIncharge}
                    onChange={handleClassInchargeChange}
                    required
                  >
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                  </Form.Control>
                </Form.Group>

                {facultyData.classIncharge === "YES" && (
                  <>
                    <Form.Group controlId="courseType">
                      <Form.Label>Course Type</Form.Label>
                      <Form.Control
                        as="select"
                        name="courseType"
                        value={facultyData.courseType}
                        onChange={(e) => {
                          handleChange(e);
                          fetchCourses(facultyData.department, e.target.value); // Fetch courses based on selected department and course type
                        }}
                        
                      >
                        <option value="">Select Course Type</option>
                        {uniqueCourseTypes.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="course">
                      <Form.Label>Course</Form.Label>
                      <Form.Control
                        as="select"
                        name="course"
                        value={facultyData.course}
                        onChange={handleChange}
                        
                      >
                        <option value="">Select Course</option>
                        {filteredCourses.map((course, index) => (
                          <option key={index} value={course.courseName}>
                            {course.courseName}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="academicYear">
                      <Form.Label>Academic Year</Form.Label>
                      <Form.Control
                        as="select"
                        name="academicYear"
                        value={facultyData.academicYear}
                        onChange={handleChange}
                        
                      >
                        <option value="">Select Academic Year</option>
                        {facultyData.courseType === "UG"
                          ? ["2022-2025", "2023-2026", "2024-2027"].map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))
                          : ["2023-2025", "2024-2026"].map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="section">
                      <Form.Label>Section</Form.Label>
                      <Form.Control
                        as="select"
                        name="section"
                        value={facultyData.section}
                        onChange={handleChange}
                        
                      >
                        <option value="">Select Section</option>
                        {["A", "B", "C", "D", "None"].map((section, index) => (
                          <option key={index} value={section}>
                            {section}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </>
                )}
              </Col>
            </Row>

            <Form.Group controlId="parentDetails">
              <h4 className="text-center text-primary">Other Details</h4>
            </Form.Group>

            <Row>
              <Col lg={6} className="mb-4">
                <Form.Group controlId="country">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    as="select"
                    name="country"
                    value={facultyData.country}
                    onChange={handleChange}
                    
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="doorNo">
                  <Form.Label>Door No</Form.Label>
                  <Form.Control
                    type="text"
                    name="doorNo"
                    value={facultyData.doorNo}
                    onChange={handleChange}
                    
                  />
                </Form.Group>

                <Form.Group controlId="street">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={facultyData.street}
                    onChange={handleChange}
                    
                  />
                </Form.Group>

                <Form.Group controlId="taluk">
                  <Form.Label>Taluk</Form.Label>
                  <Form.Control
                    type="text"
                    name="taluk"
                    value={facultyData.taluk}
                    onChange={handleChange}
                    
                  />
                </Form.Group>

                <Form.Group controlId="pincode">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    value={facultyData.pincode}
                    onChange={handleChange}
                    
                  />
                </Form.Group>
              </Col>

              <Col lg={6} className="mb-4">
                <Form.Group controlId="formState">
                  <Form.Label>State</Form.Label>
                  <Form.Control as="select" name="state" value={facultyData.state} onChange={handleChange} >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control 
                    as="select" 
                    name="city" 
                    value={facultyData.city} 
                    onChange={handleChange} 
                    
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.name.toLowerCase()}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStaffForm;