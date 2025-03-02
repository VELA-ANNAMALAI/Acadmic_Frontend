import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';

const Bulkoperations = ({ staffId, facultyName }) => {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null); // Track the upload status (success/error)
  const [errorMessage, setErrorMessage] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]); // State for photo files

  // Fetch existing student data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/students/bulk-students-dataall`);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Handle file drop
  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      handleFileRead(acceptedFiles[0]);
    }
  
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      // Log rejected files' types and extensions
      rejectedFiles.forEach(file => {
        console.log(`Rejected file: ${file.name}`);
        console.log(`File type: ${file.type}`);
        console.log(`File extension: ${file.name.split('.').pop()}`);
      });
  
      setErrorMessage('Invalid file type or extension. Please upload a CSV, XLSX, or JSON file.');
    }
  };

  const onPhotoDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setPhotoFiles(acceptedFiles); // Store the selected photo files
      setErrorMessage(null); // Reset error message
    }
  };

  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      let fileData;

      // Determine file type based on extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      try {
        if (fileExtension === 'json') {
          fileData = JSON.parse(data);
          setStudents(fileData.students); 
        } else if (fileExtension === 'csv') {
          Papa.parse(data, {
            header: true,
            complete: (results) => {
              setStudents(results.data);
            },
            error: (error) => {
              setErrorMessage('Error parsing CSV file.');
            }
          });
        } else if (['xls', 'xlsx'].includes(fileExtension)) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setStudents(jsonData);
        }
        setErrorMessage('');
      } catch (error) {
        setErrorMessage('Invalid file format. Ensure the file contains valid data.');
      }
    };
    reader.readAsBinaryString(file); // Use readAsBinaryString for XLSX
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['.csv', '.xls', '.xlsx', '.json'], // Allow both JSON and CSV/XLSX files
    maxFiles: 1, // Allow only one file at a time
  });

  const {
    getRootProps: getPhotoRootProps,
    getInputProps: getPhotoInputProps,
    isDragActive: isPhotoDragActive,
  } = useDropzone({
    onDrop: onPhotoDrop,
    accept: 'image/*', // Accept image files
    multiple: true, // Allow multiple photo uploads
  });

  const handleBulkUpload = async () => {
    if (!students || students.length === 0) {
      setErrorMessage('No students data found.');
      return;
    }
  
    try {
      setUploadStatus('Uploading...');
      setErrorMessage(null); // Reset error message
  
      // Convert all fields to uppercase except for email
      const formattedData = students.map((entry) => {
        const formattedEntry = {};
        for (const key in entry) {
          if (entry.hasOwnProperty(key)) {
            const trimmedValue = entry[key] ? entry[key].toString().trim() : null;
            formattedEntry[key] = key.toLowerCase() === 'email' ? trimmedValue : trimmedValue ? trimmedValue.toUpperCase() : null;
          }
        }
        return formattedEntry;
      });
  
      // Debugging: log formatted data
      console.log('Formatted Data:', formattedData);
  
      // Send data to the backend for bulk upload
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/students/bulk-upload`, { students: formattedData });
  
      // Debugging: log the response from the server
      console.log('Upload Response:', response.data);
  
      if (response.status === 200) {
        setUploadStatus(`Upload successful! ${response.data.count} students uploaded.`);
        alert(`Successfully uploaded ${response.data.count || 0} records!`);

      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred during the upload.');
      setUploadStatus(null); 
    }
  };
  // Handle file download for all students (XLSX)
  const handleDownload = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/students/bulk-students-dataall`);
      const studentsData = response.data;

      // Filter out unwanted fields
      const filteredData = studentsData.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

      // Create a new workbook and add the filtered students data
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      // Generate a binary string and create a Blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Create a link to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all_students.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading all students:', error);
      alert('Error generating Excel file for all students.');
    }
  };

  const handleBulkPhotoUpload = async () => {
    if (!photoFiles || photoFiles.length === 0) {
      setErrorMessage('No photo files selected.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < photoFiles.length; i++) {
      formData.append('photos', photoFiles[i]);
    }

    try {
      setUploadStatus('Uploading photos...');
      setErrorMessage(null);

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/students/bulk-upload-photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setUploadStatus(`Photos uploaded successfully!`);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setErrorMessage('Error uploading photos. Please try again.');
      setUploadStatus(null);
    }
  };
  // Generate XLSX file (optional feature)
  const generateXLSX = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/students/generate-xlsx`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating XLSX:', error);
      alert('Error generating XLSX file.');
    }
  };

  // Generate CSV file (optional feature)
  const generateCSV = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/students/generate-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
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
      <button onClick={ handleDownload} className="btn btn-info">
        Generate All Students
      </button>

      <div style={{ padding: '20px' }}>
        <h6>Bulk Upload Students</h6>
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #ccc',
            padding: '8px',
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
        {file && <p style={{ marginTop: '0px' }}>Selected File: {file.name}</p>}
        <button onClick={handleBulkUpload} className="btn btn-info mt-2">
          Bulk Upload
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>

      <div style={{ marginTop: '0px' }}>
        <h6>Upload Students Photos</h6>
        <div
          {...getPhotoRootProps()}
          style={{
            border: '2px dashed #ccc',
            padding: '5px',
            borderRadius: '10px',
            textAlign: 'center',
            background: isPhotoDragActive ? '#f0f8ff' : '#fff',
          }}
        >
          <input {...getPhotoInputProps()} />
          {isPhotoDragActive ? (
            <p>Drop your photos here...</p>
          ) : (
            <p>Drag & drop photos here, or click to select them</p>
          )}
        </div>
        {photoFiles.length > 0 && <p style={{ marginTop: '10px' }}>Selected Photo Files: {Array.from(photoFiles).map(file => file.name).join(', ')}</p>}
        <button onClick={handleBulkPhotoUpload} className="btn btn-info mt-2">
          Upload Photos
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
};
export default Bulkoperations;