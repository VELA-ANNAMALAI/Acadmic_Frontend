import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';

export default function BulkOperationFaculty() {
  const [file, setFile] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/faculties`);
        setFaculty(response.data);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      }
    };

    fetchFaculty();
  }, []);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['.csv', '.xls', '.xlsx'],
  });

  const formatDate = (date) => {
    try {
      if (typeof date === 'number') {
        // If the date is a serial number (e.g., Excel date format)
        const excelDate = new Date((date - 25569) * 86400 * 1000);
        const day = String(excelDate.getDate()).padStart(2, '0');
        const month = String(excelDate.getMonth() + 1).padStart(2, '0');
        const year = excelDate.getFullYear();
        return `${day}-${month}-${year}`;
      } else if (typeof date === 'string' && date.includes('-')) {
        // If date is already in a string format (e.g., dd-mm-yyyy)
        return date;
      } else {
        console.log('Invalid date format received:', date);
        return null;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/faculties/bulk-faculty-dataall`);
      const facultyData = response.data;

      // Filter out unwanted fields
      const filteredData = facultyData.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

      // Create a new workbook and add the filtered faculty data
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'faculty');

      // Generate a binary string and create a Blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Create a link to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all_faculty.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading all faculty:', error);
      alert('Error generating Excel file for all faculty.');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please upload a file.');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(fileExtension)) {
      alert('Invalid file format. Please upload a CSV or XLS/XLSX file.');
      return;
    }

    try {
      let parsedData = [];
      if (fileExtension === 'csv') {
        const text = await file.text();
        parsedData = Papa.parse(text, { header: true }).data;
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
      }

      if (!parsedData.length) {
        alert('No data found in the file.');
        return;
      }

      const formattedData = parsedData.map((entry) => {
        const formattedEntry = {};
        for (const key in entry) {
          if (entry.hasOwnProperty(key)) {
            const trimmedValue = entry[key] ? entry[key].toString().trim() : null;
            
            if (key.toLowerCase() !== 'email') {
              formattedEntry[key] = trimmedValue ? trimmedValue.toString().toUpperCase() : null;
            } else {
              // Keep email as is
              formattedEntry[key] = trimmedValue || null;
            }
          }
        }

        formattedEntry.dob = entry.dob ? formatDate(entry.dob) : null; // Format dob or set null
        formattedEntry.aadharno = entry.aadharno ? entry.aadharno.toString() : null; // Ensure Aadhar is a string

        return formattedEntry;


      });

      console.log('Formatted Data:', formattedData);

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/faculties/bulk-upload`,{faculty : formattedData});
      setStatus(`Successfully uploaded ${response.data.count || 0} records!`);
      console.log('Upload Response:', response.data);

      if (response.data.count === 0) {
        console.log('No records uploaded. Check the server for validation issues.');
        alert('Bulk upload successful, but no records were uploaded. Check server logs.');
      } else {
        alert(`Successfully uploaded ${response.data.count || 0} records!`);
      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      alert('Failed to upload data.');
    }
  };

  const generateXLSX = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/faculties/generate-xlsx`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'faculty.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating XLSX:', error);
      alert('Error generating XLSX file.');
    }
  };

  const generateCSV = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/faculties/generate-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'faculty.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV file.');
    }
  };

  return (
    <div className="bulk-operations">
      <button onClick={generateXLSX} className="btn btn-info">
        Generate XLSX
      </button>
      <button onClick={handleDownload} className="btn btn-info">
        Generate All Faculty
      </button>

      <div style={{ padding: '20px' }}>
        <h2>Bulk Upload Faculty</h2>
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            background: isDragActive ? '#f0f8ff' : '#fff',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop your file here...</p>
          ) : (
            <p>Drag & drop a file here, or click to select one</p>
          )}
        </div>
        {file && <p style={{ marginTop: '10px' }}>Selected File: {file.name}</p>}
        <button onClick={handleUpload} className="btn btn-info mt-4">
          Bulk Upload
        </button>
      </div>
    </div>
  );
}
