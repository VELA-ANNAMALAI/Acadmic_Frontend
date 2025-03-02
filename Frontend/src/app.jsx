import React,{useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login.jsx';
import AdminDashboard from './pages/Dashboard/AdminDashboard(old).jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddStudent from './pages/student/AddStudent.jsx';
import UpdateStudent from './pages/student/UpdateStudent.jsx';
import UpdatePage from './pages/student/stuupdatepage.jsx';

import studentAttendancePage from './pages/student/AttendanceStudent.jsx';
import Attendance from './pages/student/AttendanceStudent.jsx';
import AttendanceReport from './pages/student/AttendanceReport.jsx';
import AddEvent from './pages/Event/AddEvent.jsx';
import ReportEvent from './pages/Event/ReportEvent.jsx';
import EventDetails from './pages/Event/EventDetails.jsx';
import UpdateAttendance from './pages/student/UpdateAttendance.jsx';
import Bulkoperation from './pages/student/bulkoperations.jsx';
import UpdateEvent from './pages/Event/UpdateEvent.jsx';

import StudentMark from './pages/Mark/StudentMark.jsx';
import MentieList from './pages/Mentorship/MentieList.jsx';
import MentieDetails from './pages/Mentorship/MentieDetails.jsx';
import Academic_Course from './pages/courses/Academic_Course.jsx';
import { Import } from 'lucide-react';
import AuthProvider from './hooks/AuthProvider.jsx';

import Facultydashboard from './pages/faculty/Facultydashboard.jsx';



//adminpages
import AddDegree from './pages/Add Degree/Degree.jsx';
import Overallmentie  from './pages/Dashboard/Admin_overallmentorship/overallmentie.jsx';
import UpdateFaculty from './pages/faculty/UpdateFaculty.jsx';
import Updatefacultypage from './pages/faculty/updatefacultypage.jsx'
import AddStaff from './pages/faculty/AddFaculty.jsx'; // New page
import AdminAcademic_Course from './pages/Dashboard/adminpages/Admin_courses/Academic_Course.jsx';
//adminstudentpage

import Adminaddstudents from './pages/Dashboard/adminpages/Admin_student/AddStudent.jsx';
import AdminAttendanceReport from './pages/Dashboard/adminpages/Admin_student/AttendanceReport.jsx';
import AdminAttendance from './pages/Dashboard/adminpages/Admin_student/AttendanceStudent.jsx';
import AdminUpdateStudent from './pages/Dashboard/adminpages/Admin_student/UpdateStudent.jsx';
import AdminUpdatePage from './pages/Dashboard/adminpages/Admin_student/stuupdatepage.jsx';
import AdminUpdateAttendance from './pages/Dashboard/adminpages/Admin_student/UpdateAttendance.jsx';

//admineventpages

import AdminAddEvent from './pages/Dashboard/adminpages/Admin_Event/AddEvent.jsx';
import AdminEventDetails from './pages/Dashboard/adminpages/Admin_Event/EventDetails.jsx';
import AdminReportEvent from './pages/Dashboard/adminpages/Admin_Event/ReportEvent.jsx';
import AdminStudentMark from './pages/Dashboard/adminpages/Admin_Mark/StudentMark.jsx';
function App() {


  const [userRole, setUserRole] = useState("Admin");

  return (

    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login setUserRole={setUserRole} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard userRole={userRole} setUserRole={setUserRole} />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/addfaculty" element={<AddStaff />} /> 
        <Route path="/addstudent" element={<AddStudent />} /> 
        <Route path="/updatestudent" element={<UpdateStudent/>} />
        <Route path="/studentattendance" element={<Attendance/>} />
        <Route path="/AttendanceReport" element={<AttendanceReport/>} />
        <Route path="/bulkoperations"  element={<Bulkoperation/>}/>
        <Route path="*" element={<Login />} />  {/* Redirect unknown routes */}

        <Route path="/overallmentie"  element={<Overallmentie />} />
<Route path="/Degree" element={<AddDegree/>} />
        <Route path="/faculty-dashboard" element={<Facultydashboard />} />


        <Route path="/update-student/:registerno" element={<UpdatePage />} />
        <Route path="/UpdateAttendance" element={<UpdateAttendance/>} />

        <Route path="/updatefaculty" element={<UpdateFaculty/>} />
        <Route path="/updatefacultypage/:staffId" element={<Updatefacultypage/>} />

        <Route path="/AddEvent" element={<AddEvent/>} />
        <Route path="/ReportEvent" element={<ReportEvent/>} />
        <Route path="/event/:eventId" element={<EventDetails />} />
        <Route path="/UpdateEvent" element={<UpdateEvent/>}/>

        <Route path="/courses" element={<Academic_Course/>} />

        <Route path="/mentorship/:staffId/:facultyName" element={<MentieList/>} />
        <Route path="/mentiedetails/:studentId/:staffId/:facultyName" element={<MentieDetails/>} />

        <Route path="/Mark" element={<StudentMark/>} />
        <Route path="/AdminMark" element={<AdminStudentMark/>} />
<Route path="/Adminaddstudent" element={<Adminaddstudents/>}/>
<Route path="/Adminupdatestudent" element={<AdminUpdateStudent/>} />
<Route path="/Adminstudentattendance" element={<AdminAttendance/>} />
<Route path="/AdminAttendanceReport" element={<AdminAttendanceReport/>} />
<Route path="/AdminUpdateAttendance" element={<AdminUpdateAttendance/>} />
<Route path="/AdminAddEvent" element={<AdminAddEvent/>} />
        <Route path="/AdminReportEvent" element={<AdminReportEvent/>} />
        <Route path="/Adminevent/:eventId" element={<AdminEventDetails />} />
        <Route path="/Admincourses" element={<AdminAcademic_Course/>} />

      </Routes>

    </AuthProvider>
  );
}

export default App;
