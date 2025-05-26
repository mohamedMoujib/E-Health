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
  Avatar,
  Pagination,
  Box,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientsList, setCurrentPatient } from '../Redux/slices/patientsSlice';
import { fetchUserProfile } from '../Redux/slices/userSlice';
import CreatePatientModal from '../components/CreatePatientModal'; // Import the modal component

const Patients = () => {
  const dispatch = useDispatch();
  const { list: patients, status, error } = useSelector((state) => state.patients);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  
  // Updated state management for CreatePatientModal
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const profile = useSelector((state) => state.user.profile);
  const loadingProfile = useSelector((state) => state.user.loading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile && !loadingProfile) {
      dispatch(fetchUserProfile()).then((res) => {
      }).catch(err => console.error("Error fetching profile:", err));
    }
  }, [dispatch, profile, loadingProfile]);

  useEffect(() => {
    if (profile?._id) {
      console.log("Dispatching fetchPatientsList with doctorId:", profile._id);
      dispatch(fetchPatientsList());
    }
  }, [dispatch, profile]);

  // Handle opening the CreatePatientModal for adding new patient
  const handleAddPatient = () => {
    setPatientToEdit(null); // Clear any existing patient data
    setOpenCreateModal(true);
  };

  // Handle successful patient creation/update
  const handlePatientAdded = () => {
    // Refresh the patient list
    dispatch(fetchPatientsList());
    setOpenCreateModal(false);
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setPatientToEdit(patient);
    setOpenCreateModal(true);
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    dispatch(setCurrentPatient(patient));
    navigate(`/dashboard/patients/${patient._id}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (patient) => {
    setPatientToDelete(patient);
    setOpenDeleteDialog(true);
  };

  // Handle patient deletion
  const handleDeletePatient = () => {
    // Implement delete functionality here
    // dispatch(deletePatient(patientToDelete._id));
    setOpenDeleteDialog(false);
    setPatientToDelete(null);
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(indexOfFirstRecord, indexOfLastRecord);

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'inactive': return { bg: '#ffebee', text: '#c62828' };
      default: return { bg: '#e0e0e0', text: '#757575' };
    }
  };

  return (
    <>
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ padding: '24px', flex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h4" component="h1" 
              sx={{ 
                fontWeight: 600,
                color: '#263238',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Patients
            </Typography>
            
            <Tooltip title="Add new patient">
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={handleAddPatient} // Updated to use CreatePatientModal
                sx={{
                  borderRadius: "12px",
                  padding: '8px 16px',
                  backgroundColor: "#0A192F",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(98, 0, 234, 0.)",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0A192F",
                    boxShadow: "0 6px 16px rgba(35, 29, 44, 0.3)",
                  }
                }}
              >
                Ajouter Patient
              </Button>
            </Tooltip>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3
          }}>
            <TextField
              placeholder="Chercher patients..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                maxWidth: { xs: '100%', sm: 300 },
                minWidth: { xs: '100%', sm: 300 },
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${patients.length}`} 
                variant="outlined" 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }} 
              />
              <Chip 
                label={`Active: ${patients.filter(p => p.status === 'active').length}`} 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  bgcolor: '#e8f5e9',
                  color: '#2e7d32'
                }} 
              />
              <Chip 
                label={`Inactive: ${patients.filter(p => p.status === 'inactive').length}`} 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  bgcolor: '#ffebee',
                  color: '#c62828'
                }} 
              />
            </Box>
          </Box>
          
          {/* Loading, Error states */}
          {status === 'loading' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading patients...</Typography>
            </Box>
          )}
          
          {status === 'failed' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="error">Error: {error}</Typography>
            </Box>
          )}
          
          {status !== 'loading' && (
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                mb: 3
              }}
            >
              <Table>
                <TableHead>
                  <TableRow 
                    sx={{
                      bgcolor: '#f5f7fa',
                      '& th': {
                        padding: '16px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#546e7a',
                        borderBottom: '2px solid #eceff1'
                      }
                    }}
                  >
                    <TableCell>#</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell align='center'>Date de Naissance</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((patient, index) => {
                      const statusStyle = getStatusColor(patient.status);
                      
                      return (
                        <TableRow
                          key={patient._id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#fafafa',
                            },
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                            '&:last-child td, &:last-child th': {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {indexOfFirstRecord + index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                alt={patient.name}
                                src={patient.image}
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={550}>
                                  {patient.firstName} {patient.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {patient.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            {patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{patient.phone}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{patient.address}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1)}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.text,
                                fontWeight: 500,
                                borderRadius: 1
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginRight:'20px', gap: 1 }}>
                              <Tooltip title="View details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewPatient(patient)}
                                  sx={{ 
                                    color: '#0A192F',
                                    '&:hover': { bgcolor: 'info.lighter' }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          Pas de patients 
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              Affichage {currentRecords.length} sur {filteredPatients.length} patients
            </Typography>
            <Pagination
              count={Math.ceil(filteredPatients.length / recordsPerPage)}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              shape="rounded"
              sx={{ 
                '& .MuiPaginationItem-root': {
                  fontWeight: 500,
                  backgroundColor: "#0A192F",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#0A192F",
                    boxShadow: "0 6px 16px rgba(35, 29, 44, 0.3)",
                  }
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Patient Modal */}
      <CreatePatientModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        editPatient={patientToEdit}
        onPatientAdded={handlePatientAdded}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le patient{' '}
            <strong>
              {patientToDelete?.firstName} {patientToDelete?.lastName}
            </strong>{' '}
            ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeletePatient}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Patients;