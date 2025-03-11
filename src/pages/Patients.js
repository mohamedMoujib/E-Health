import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const accessToken = useSelector(state => state.auth.accessToken); // Assuming auth slice has accessToken

  useEffect(() => {
    // Fetch patients data from an API or any other source
    const fetchPatients = async () => {
      try {
        if (!accessToken) {
          console.error('No access token available');
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctors/:id/patients`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, [accessToken]);

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current patients for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Patients List</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" color="primary">
          Add Patient
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Treatment</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRecords.map((patient, index) => (
              <TableRow key={patient.id}>
                <TableCell>{indexOfFirstRecord + index + 1}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.bloodGroup}</TableCell>
                <TableCell>{patient.treatment}</TableCell>
                <TableCell>{patient.mobile}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.address}</TableCell>
                <TableCell>
                  <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                  <Button variant="contained" color="success" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button variant="contained" color="info" startIcon={<VisibilityIcon />}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(filteredPatients.length / recordsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default Patients;