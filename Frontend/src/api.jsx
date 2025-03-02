// frontend/src/api.js
import axios from "axios";

const API_URL = "https://academic-backend-5azj.onrender.com/api";

export const registerStudent = async (student) => {
  const response = await axios.post(`${API_URL}/students/register`, student);
  return response.data;
};

export const getStudents = async () => {
  const response = await axios.get(`${API_URL}/students`);
  return response.data;
};
