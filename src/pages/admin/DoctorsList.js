import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { axiosInstance } = useAuth();
  const navigate = useNavigate();

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch doctors");
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [axiosInstance]);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor => 
    doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/doctors/${id}`);
  };

  const handleToggleStatus = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenDialog(true);
  };

  const confirmStatusChange = async () => {
    try {
      const newStatus = selectedDoctor.status === 'active' ? 'inactive' : 'active';
      await axiosInstance.patch(`/admin/doctors/${selectedDoctor._id}/status`, {
        status: newStatus
      });
      
      // Update the doctors list
      setDoctors(doctors.map(doc => 
        doc._id === selectedDoctor._id ? {...doc, status: newStatus} : doc
      ));
      
      setOpenDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor status");
      setOpenDialog(false);
    }
  };

  if (loading) return <Typography>Loading doctors...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Doctors Management
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="doctors table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Specialty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor._id} hover>
                  <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.specialty || "Not specified"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={doctor.status === 'active' ? 'Active' : 'Inactive'} 
                      color={doctor.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      aria-label="view details"
                      onClick={() => handleViewDetails(doctor._id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      aria-label="edit"
                      onClick={() => navigate(`/admin/doctors/${doctor._id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color={doctor.status === 'active' ? 'error' : 'success'}
                      aria-label={doctor.status === 'active' ? 'deactivate' : 'activate'}
                      onClick={() => handleToggleStatus(doctor)}
                    >
                      {doctor.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No doctors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {selectedDoctor?.status === 'active' 
            ? "Deactivate Doctor Account?" 
            : "Activate Doctor Account?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selectedDoctor?.status === 'active'
              ? `Are you sure you want to deactivate ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}'s account? They will no longer be able to access the system.`
              : `Are you sure you want to activate ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}'s account? They will be able to access the system again.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmStatusChange} 
            color={selectedDoctor?.status === 'active' ? "error" : "success"} 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DoctorsList;