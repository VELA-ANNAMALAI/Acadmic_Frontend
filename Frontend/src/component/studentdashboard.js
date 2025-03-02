// frontend/src/components/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { getStudents } from "../api";

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchStudents();
  }, []);

  return (
    <div>
      <h2>Student Dashboard</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id}>
            {student.name} ({student.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;
