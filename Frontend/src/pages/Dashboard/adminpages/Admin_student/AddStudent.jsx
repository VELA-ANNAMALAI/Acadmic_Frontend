import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { Country, State, City } from 'country-state-city';
import AdminSidebar from "../Admin_sidebar/AdminSidebar";

const Adminaddstudents = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    gender: "FEMALE",
    bloodGroup: "",
    email: "",
    dob: "",
    phone: "",
    Religion: "",
    Community: "",
    Nationality: "INDIAN",
    fatherName: "",
    motherName: "",
    parentOccupation: "",
    parentPhone: "",
    section: "",
    registerno: "",
    dayscholarOrHostel: "",
    busNo: "",
    busStage: "",
    hostelName: "",
    roomNumber: "",
    courseType: "",
    course: "",
    academicYear: "",
    department: "",
    barcode: "",
    doorno: "",
    street: "",
    taluk: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    aadharno: "",
    abcid: "",
    mentorship: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(''); 
  const [selectedState, setSelectedState] = useState('');
  const [facultyNames, setFacultyNames] = useState([]);
  const [photo, setPhoto] = useState(null);
  
  // New state for degrees and courses
  const [degrees, setDegrees] = useState([]);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const busNumbers = ["A103", "A51", "A183", "A173"];
  const sections = ["A", "B", "C", "D", "None"];
  const hostelNames = ["GANGA", "YAMUNA", "BHAVANI"];
  const academicYearsUG = ["2022-2025", "2023-2026", "2024-2027"];
  const academicYearsPG = ["2023-2025", "2024-2026"];
  const Religionoption = ["HINDU", "MUSLIM", "CHRISTIAN"];
  const CommunityOptions = ["OC", "BC", "MBC"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // If department or courseType changes, fetch courses
    if (name === "department" || name === "courseType") {
      fetchCourses(name === "department" ? value : studentData.department, name === "courseType" ? value : studentData.courseType);
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]); // Store the selected file
  };

  useEffect(() => {
    fetchCountries();
    fetchFacultyNames(); // Fetch faculty names on component mount
    fetchDegrees(); // Fetch degrees on component mount
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      fetchCities(selectedCountry, selectedState);
    }
  }, [selectedCountry, selectedState]);

  const fetchCountries = () => {
    const countryData = Country.getAllCountries();
    setCountries(countryData);
  };

  const fetchStates = (countryCode) => {
    const stateData = State.getStatesOfCountry(countryCode);
    setStates(stateData);
    setCities([]); // Reset cities when country changes
    setSelectedState(''); // Reset selected state
  };

  const fetchCities = (countryCode, stateCode) => {
    const cityData = City.getCitiesOfState(countryCode, stateCode);
    setCities(cityData);
  };

  const fetchFacultyNames = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/addstudents/facultyname`); // Adjust the URL as needed
      setFacultyNames(response.data);
    } catch (error) {
      console.error("Error fetching faculty names:", error);
    }
  };

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
      setDegrees(response.data);
      // Extract unique departments and course types
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

  const validateForm = async () => {
    const { email, registerno, phone, barcode, aadharno, abcid } = studentData;

    const emailRegex = /^[a-z0-9._%+-]+@gmail.com$/;
    if (!emailRegex.test(email)) {
      setError("Email must end with @vicas.org");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }

    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadharno)) {
      setError("Aadhar number must be 12 digits");
      return false;
    }

    const abcidRegex = /^\d{12}$/;
    if (!abcidRegex.test(abcid)) {
      setError("ABC ID must be in the format ABC123");
      return false;
    }

   

    const barcodeRegex = /^\d{10}$/;
    if (!barcodeRegex.test(barcode)) {
      setError("Barcode must be 10 digits");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(studentData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/addstudents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setStudentData({
        name: "",
        gender: "FEMALE",
        bloodGroup: "",
        email: "",
        dob: "",
        phone: "",
        Religion: "",
        Community: "",
        Nationality: "INDIAN",
        fatherName: "",
        motherName: "",
        parentOccupation: "",
        parentPhone: "",
        section: "",
        registerno: "",
        dayscholarOrHostel: "",
        busNo: "",
        busStage: "",
        hostelName: "",
        roomNumber: "",
        courseType: "",
        course: "",
        academicYear: "",
        department: "",
        barcode: "",
        doorno: "",
        street: "",
        taluk: "",
        pincode: "",
        city: "",
        state: "",
        country: "",
        aadharno: "",
        abcid: "",
        mentorship: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setStudentData(prevData => ({
      ...prevData,
      country: countryCode // Update student data with selected country
    }));
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setStudentData(prevData => ({
      ...prevData,
      state: stateCode // Update student data with selected state
    }));
  };

  return (
    <Container fluid>
      <Row>
      <Col xs={2} className="sidebar">
          <AdminSidebar/>
        </Col>

        <Col xs={10}  className="main-content">

      <h3 className="mb-2 mt-2 text-center bg-info-subtle">Add New Student</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Data submitted successfully!</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={6} className="mb-4">
            <h4 className="text-center text-primary">Personal Information</h4>
            <Form.Group controlId="name">
              <Form.Label>Student Name</Form.Label>
              <Form.Control type="text" name="name" value={studentData.name} onChange={handleChange} required />
            </Form.Group>

            <div className="mb-2 mt-3 mx-2 row">
              <div className="form-check col">
                <input className="form-check-input" type="radio" name="gender" id="FEMALE" value="FEMALE"
                  checked={studentData.gender === "FEMALE"}
                  onChange={handleChange} />
                <label className="form-check-label" htmlFor="FEMALE">
                  Female
                </label>
              </div>
              <div className="form-check col">
                <input className="form-check-input" type="radio" name="gender" id="MALE" value="MALE"
                  checked={studentData.gender === "MALE"}
                  onChange={handleChange} />
                <label className="form-check-label" htmlFor="MALE">
                  Male
                </label>
              </div>
            </div>

            <Form.Group controlId="bloodGroup">
              <Form.Label>Blood Group</Form.Label>
              <Form.Control as="select" name="bloodGroup" value={studentData.bloodGroup} onChange={handleChange} >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={studentData.email} onChange={handleChange} />
            </Form.Group>

            <Form.Group controlId="dob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="dob" value={studentData.dob} onChange={handleChange}  />
            </Form.Group>

            <Form.Group controlId="phone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="number" name="phone" value={studentData.phone} onChange={handleChange} />
            </Form.Group>

            <div className="mb-2 mt-3 mx-2 row">
              <div className="form-check col">
                <input className="form-check-input" type="radio" name="Nationality" id="INDIAN" value="INDIAN"
                  checked={studentData.Nationality === "INDIAN"} onChange={handleChange} />
                <label className="form-check-label" htmlFor="INDIAN">
                  Indian
                </label>
              </div>
              <div className="form-check col">
                <input className="form-check-input" type="radio" name="Nationality" id="OTHER" value="OTHER" 
                  checked={studentData.Nationality === "OTHER"} onChange={handleChange} />
                <label className="form-check-label" htmlFor="OTHER">
                  Other
                </label>
              </div>
            </div>

            <Form.Group controlId="Religion">
              <Form.Label>Religion</Form.Label>
              <Form.Control as="select" name="Religion" value={studentData.Religion} onChange={handleChange} >
                <option value="">Select Religion</option>
                {Religionoption.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="Community">
              <Form.Label>Community</Form.Label>
              <Form.Control as="select" name="Community" value={studentData.Community} onChange={handleChange} >
                <option value="">Select Community</option>
                {CommunityOptions.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="aadharno">
              <Form.Label>Aadhar No</Form.Label>
              <Form.Control 
                type="number" 
                name="aadharno" 
                value={studentData.aadharno} 
                onChange={handleChange} 
                
              />
            </Form.Group>

            <Form.Group controlId="abcid">
              <Form.Label>ABC Id</Form.Label>
              <Form.Control type="text" name="abcid" value={studentData.abcid} onChange={handleChange}  />
            </Form.Group>          
          </Col>

          <Col lg={6} className="mb-4">
          <h4 className="text-center text-primary">Academic Information</h4>

            <Form.Group controlId="registerno">
              <Form.Label>Register Number</Form.Label>
              <Form.Control
                type="text"
                name="registerno"
                value={studentData.registerno}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="barcode">
              <Form.Label>Barcode Number :</Form.Label>
              <Form.Control type="number" name="barcode" value={studentData.barcode} onChange={handleChange }  />
            </Form.Group>

            <Form.Group controlId="department">
              <Form.Label>Department</Form.Label>
              <Form.Control as="select" name="department" value={studentData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                {uniqueDepartments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="courseType">
              <Form.Label>Course Type</Form.Label>
              <Form.Control as="select" name="courseType" value={studentData.courseType} onChange={handleChange} required>
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
                value={studentData.course}
                onChange={handleChange}
                required
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
              <Form.Label>Batch</Form.Label>
              <Form.Control as="select" name="academicYear" value={studentData.academicYear} onChange={handleChange} required>
                <option value="">Select Academic Year</option>
                {studentData.courseType === "UG"
                  ? academicYearsUG.map((year) => <option key={year} value={year}>{year}</option>)
                  : academicYearsPG.map((year) => <option key={year} value={year}>{year}</option>)}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="section">
              <Form.Label>Section</Form.Label>
              <Form.Control
                as="select"
                name="section"
                value={studentData.section}
                onChange={handleChange}
                required
              >
                <option value="">Select section</option>
                {sections.map((section, index) => (
                  <option key={index} value={section}>
                    {section}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="dayscholarOrHostel">
              <Form.Label>Dayscholar or Hostel</Form.Label>
              <Form.Control
                as="select"
                name="dayscholarOrHostel"
                value={studentData.dayscholarOrHostel}
                onChange={handleChange}
                
              >
                <option value="">Select</option>
                <option value="DAYSCHOLAR">Dayscholar</option>
                <option value="HOSTEL">Hostel</option>
              </Form.Control>
            </Form.Group>

            {studentData.dayscholarOrHostel === "DAYSCHOLAR" && (
              <>
                <Form.Group controlId="busNo">
                  <Form.Label>Bus Number</Form.Label>
                  <Form.Control as="select" name="busNo" value={studentData.busNo} onChange={handleChange}>
                    <option value="">Select Bus Number</option>
                    {busNumbers.map((bus) => (
                      <option key={bus} value={bus}>
                        {bus}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="busStage">
                  <Form.Label>Bus Stage</Form.Label>
                  <Form.Control type="text" name="busStage" value={studentData.busStage} onChange={handleChange} />
                </Form.Group>
              </>
            )}

            {studentData.dayscholarOrHostel === "HOSTEL" && (
              <>
                <Form.Group controlId="hostelName">
                  <Form.Label>Hostel Name</Form.Label>
                  <Form.Control as="select" name="hostelName" value={studentData.hostelName} onChange={handleChange}>
                    <option value="">Select Hostel Name</option>
                    {hostelNames.map((hostel) => (
                      <option key={hostel} value={hostel}>
                        {hostel}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="roomNumber">
                  <Form.Label>Room Number</Form.Label>
                  <Form.Control type="number" name="roomNumber" value={studentData.roomNumber} onChange={handleChange } />
                </Form.Group>
              </>
            )}
          </Col>
        </Row>
        <hr className="border-primary w-90"></hr>
<Row>
        <Col lg={6} className="mb-4">

        <Form.Group controlId="parentDetails">
        <h4 className="text-center text-primary">Parent Details</h4>
        <Row>
           
          <Form.Group controlId="fatherName">
              <Form.Label>Father's Name</Form.Label>
              <Form.Control
                type="text"
                name="fatherName"
                value={studentData.fatherName}
                onChange={handleChange}
                
              />
            </Form.Group>
            <Form.Group controlId="motherName">
              <Form.Label>Mother's Name</Form.Label>
              <Form.Control
                type="text"
                name="motherName"
                value={studentData.motherName}
                onChange={handleChange}
                
              />
            </Form.Group>

            <Form.Group controlId="parentOccupation">
              <Form.Label>Parent's Occupation</Form.Label>
              <Form.Control
                type="text"
                name="parentOccupation"
                value={studentData.parentOccupation}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="parentPhone">
              <Form.Label>Parent's Phone Number</Form.Label>
              <Form.Control
                type="number"
                name="parentPhone"
                value={studentData.parentPhone}
                onChange={handleChange}
                
              />
            </Form.Group>
          </Row>
        </Form.Group>

        <Form.Group controlId="country">
          <Form.Label>Country</Form.Label>
          <Form.Control
            as="select"
            name="country"
            value={selectedCountry}
            onChange={handleCountryChange}
            
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="doorno">
          <Form.Label>Door no</Form.Label>
          <Form.Control
            type="text"
            name="doorno"
            value={studentData.doorno}
            onChange={handleChange}
            
          />
        </Form.Group>

  

        </Col>
        <Col lg={6} className="mb-4">

   

        <Form.Group controlId="street">
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={studentData.street}
            onChange={handleChange}
            
          />
        </Form.Group>

        <Form.Group controlId="formState">
          <Form.Label>State</Form.Label>
          <Form.Control as="select" value={selectedState} onChange={handleStateChange} disabled={!selectedCountry}>
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
            value={studentData.city} 
            onChange={handleChange} 
            disabled={!selectedState}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.id} value={city.name.toLowerCase()}>
                {city.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="taluk">
          <Form.Label>Taluk :</Form.Label>
          <Form.Control type="text" name="taluk" value={studentData.taluk} onChange={handleChange}  />
        </Form.Group>

        <Form.Group controlId="pincode">
          <Form.Label>Pincode:</Form.Label>
          <Form.Control type="number" name="pincode" value={studentData.pincode} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="formMentorship">
          <Form.Label>Mentor</Form.Label>
          <Form.Control as="select" name="mentorship" value={studentData.mentorship} onChange={handleChange}>
            <option value="">Select Mentor</option>
            {facultyNames.map(faculty => (
              <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="photo">
          <Form.Label>Upload Student Photo</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleFileChange}  />
        </Form.Group>
</Col>
</Row>
       

        <Button  type="submit" variant="primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </ Button>

      </Form>
      </Col>
      </Row>
    </Container>
  );
};

export default 
Adminaddstudents;