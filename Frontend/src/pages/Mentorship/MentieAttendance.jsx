import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';

import './MentieDetails.css'; // Import custom CSS

export default function MentieAttendance() {
  const { studentId } = useParams(); // Get the student ID from the URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);


  useEffect(() => {

    setAttendanceData([
        { sem: "Sem 1", jun: 75, jul: 80, aug: 85, sep: 90, oct: 88, nov: 92, percentage: 85 },
        { sem: "Sem 3", jun: 80, jul: 82, aug: 88, sep: 90, oct: 85, nov: 91, percentage: 86 },
        { sem: "Sem 5", jun: 72, jul: 75, aug: 78, sep: 80, oct: 85, nov: 88, percentage: 80 },
      ]);

    const fetchStudentDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}`
        );
        setStudent(response.data);
      } catch (err) {
        console.error('Error fetching student attendance:', err);
        setError('Failed to fetch attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading) {
    return <p>Loading attendance details...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="accordion-item">
      <h2
        className={`accordion-header ${openSection === 'attendance' ? 'active' : ''}`}
        onClick={() => toggleSection('attendance')}
      >
        <FaClipboardList className="me-2" /> Attendance Particulars
      </h2>
      {openSection === 'attendance' && (
         <div
         id="collapseAttendance"
         className="accordion-collapse collapse show"
         aria-labelledby="headingAttendance"
         data-bs-parent="#attendanceAccordion"
       >
         <div className="accordion-body">
           {/* Table 1: Attendance Details */}
           <table className="table table-bordered table-striped">
             <thead className="table-dark">
               <tr>
                 <th>Sem</th>
                 <th>Jun</th>
                 <th>Jul</th>
                 <th>Aug</th>
                 <th>Sep</th>
                 <th>Oct</th>
                 <th>Nov</th>
                 <th>Percentage</th>
               </tr>
             </thead>
             <tbody>
               {attendanceData.map((item, index) => (
                 <tr key={index}>
                   <td>{item.sem}</td>
                   <td>{item.jun}%</td>
                   <td>{item.jul}%</td>
                   <td>{item.aug}%</td>
                   <td>{item.sep}%</td>
                   <td>{item.oct}%</td>
                   <td>{item.nov}%</td>
                   <td>{item.percentage}%</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     
      )}
    </div>
  );
}
