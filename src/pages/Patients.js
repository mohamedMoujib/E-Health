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
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  Grid
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
const Patients = () => {
  const dispatch = useDispatch();
  const { list: patients, status, error } = useSelector((state) => state.patients);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    cin: '',
    dateOfBirth: ''
  });
  const [isEditing, setIsEditing] = useState(false);

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



  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle dialog open/close
  const handleAddDialogOpen = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      cin: '',
      dateOfBirth: ''
    });
    setIsEditing(false);
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setFormData({
      id: patient.id,
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      cin: patient.cin || '',
      dateOfBirth: patient.dateOfBirth || ''
    });
    setIsEditing(true);
    setOpenAddDialog(true);
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    dispatch(setCurrentPatient(patient));
    // Here you would typically navigate to a patient details page
    navigate(`/dashboard/patients/${patient._id}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (patient) => {
    setPatientToDelete(patient);
    setOpenDeleteDialog(true);
  };

  // Handle patient form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // if (isEditing) {
    //   dispatch(updatePatient({ id: formData.id, patientData: formData }));
    // } else {
    //   dispatch(addPatient(formData));
    // }
    
    handleAddDialogClose();
  };

  // Handle patient deletion
  const handleDeletePatient = () => {
    // if (patientToDelete) {
    //   dispatch(deletePatient(patientToDelete.id));
    //   setOpenDeleteDialog(false);
    //   setPatientToDelete(null);
    // }
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
              Liste des Patients
            </Typography>
            
            <Tooltip title="Add new patient">
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={handleAddDialogOpen}
                sx={{
                  borderRadius: "12px",
                  padding: '8px 16px',

                  backgroundColor: "#0A192F",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(98, 0, 234, 0.)",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "##0A192F",
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
                                {patient.name?.charAt(0)}
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
                          <TableCell align='center' >{patient.dateOfBirth.split('T')[0]} </TableCell>
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
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end',marginRight:'20px' , gap: 1 }}>
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

                            {patient.status === 'inactive' && (
                              <>
                                <Tooltip title="Edit patient">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditPatient(patient)}
                                    sx={{ 
                                      color: 'warning.main',
                                      '&:hover': { bgcolor: 'warning.lighter' }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete patient">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteConfirmation(patient)}
                                    sx={{ 
                                      color: 'error.main',
                                      '&:hover': { bgcolor: 'error.lighter' }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
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
                  backgroundColor: "##0A192F",
                  boxShadow: "0 6px 16px rgba(35, 29, 44, 0.3)",
                }
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Patient Dialog */}
      <Dialog
  open={openAddDialog}
  onClose={handleAddDialogClose}
  maxWidth="md"
  fullWidth
  sx={{
    '& .MuiPaper-root': {
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      backgroundColor: '#ffffff',
    },
  }}
>
  <DialogTitle
    sx={{
      pb: 0,
      backgroundColor: '#f5f5f5',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      color: '#263238',
      fontWeight: 600,
      fontSize: '1.25rem',
      padding: '24px',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {isEditing ? 'Modifier Patient' : 'Ajouter Patient'}
      <IconButton
        onClick={handleAddDialogClose}
        size="small"
        sx={{
          padding: 0,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <CloseIcon sx={{ color: '#757575' }} />
      </IconButton>
    </Box>
  </DialogTitle>
  <DialogContent
    dividers
    sx={{
      padding: '24px !important',
      '& .MuiDialogContent-root': {
        overflow: 'auto',
      },
    }}
  >
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#263238',
              mb: 2,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px',
            }}
          >
            Informations personnelles
          </Typography>
        </Grid>
        {/* First Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Prénom"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE', // Teal accent
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Last Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nom"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Contact Information Section */}
        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#263238',
              mt: 4,
              mb: 2,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px',
            }}
          >
            Informations de contact
          </Typography>
        </Grid>
        {/* Email */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Phone */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            multiline
            rows={3}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Identification Section */}
        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#263238',
              mt: 4,
              mb: 2,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px',
            }}
          >
            Identifiants
          </Typography>
        </Grid>
        {/* CIN */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="CIN"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
        {/* Date of Birth */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date de Naissance"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiInputBase-input': {
                paddingTop: '12px !important',
                paddingBottom: '12px !important',
              },
              '& .MuiInputLabel-root': {
                color: '#263238',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#78B3CE',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: '#78B3CE',
              },
            }}
          />
        </Grid>
       
      </Grid>
      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          pt: 2,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleAddDialogClose}
          sx={{
            borderColor: '#e0e0e0',
            color: '#757575',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#78B3CE',
            },
          }}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            bgcolor: '#78B3CE',
            '&:hover': {
              bgcolor: '#6AAED9',
            },
            textTransform: 'none',
            fontWeight: 500,
            ml: 2,
          }}
        >
          {isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
      </DialogActions>
    </form>
  </DialogContent>
</Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {patientToDelete?.name}? Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Annuler</Button>
          <Button onClick={handleDeletePatient} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Patients;