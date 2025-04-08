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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { useSelector, useDispatch } from 'react-redux';
import { getDoctorAppointments } from '../Redux/slices/appointmentSlice';
import { fetchPatientsList } from '../Redux/slices/patientsSlice';
import { fetchUserProfile } from '../Redux/slices/userSlice';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay, format, isSameDay } from 'date-fns';
import GlobalAppointmentModal from '../components/GlobalAppointmentModal'; // Adjust path as needed

const RendezVous = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Redux state
  const { appointments, status, error: appointmentError } = useSelector((state) => state.appointments);
  const { list: patients, error: patientsError } = useSelector((state) => state.patients);
  const profile = useSelector((state) => state.user.profile);
  const loadingProfile = useSelector((state) => state.user.loading);
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date(),
    time: '',
    status: '',
    notes: ''
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [specificDate, setSpecificDate] = useState(null);
  const [isSpecificDateActive, setIsSpecificDateActive] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // Date filtering logic
  const filterByDateRange = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    // If specific date is selected, filter by that day
    if (isSpecificDateActive && specificDate) {
      return isSameDay(appointmentDate, specificDate);
    }
    
    // Otherwise use the period filter
    switch(selectedFilter) {
      case 'day':
        return isWithinInterval(appointmentDate, {
          start: startOfDay(now),
          end: endOfDay(now)
        });
      case 'week':
        return isWithinInterval(appointmentDate, {
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
      case 'month':
        return isWithinInterval(appointmentDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
      default:
        return true;
    }
  };

  // Handle specific date selection
  const handleDateSelect = (date) => {
    setSpecificDate(date);
    setIsSpecificDateActive(true);
    setSelectedFilter('all'); // Reset period filter when selecting specific date
    setOpenDatePicker(false);
  };

  // Clear specific date filter
  const clearDateFilter = () => {
    setSpecificDate(null);
    setIsSpecificDateActive(false);
  };

  // Load user profile
  useEffect(() => {
    if (!profile && !loadingProfile) {
      dispatch(fetchUserProfile()).catch(err => console.error("Error fetching profile:", err));
    }
  }, [dispatch, profile, loadingProfile]);

  // Load appointments and patients
  useEffect(() => {
    dispatch(getDoctorAppointments());
    dispatch(fetchPatientsList());
  }, [dispatch, profile]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, specificDate, isSpecificDateActive, searchQuery]);

  const refreshAppointments = () => {
    dispatch(getDoctorAppointments());
  };
  // Form handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

 
  const handleViewAppointment = (appointment) => {
    navigate(`/dashboard/Patients/${appointment.patient._id}/appointments`, { state: { appointment } });
  };

  
  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };
  

  

  // When period filter changes, clear specific date filter
  const handlePeriodFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    setIsSpecificDateActive(false);
    setSpecificDate(null);
  };

  // Data filtering and pagination
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safePatients = Array.isArray(patients) ? patients : [];

  // Filter out completed appointments and apply other filters
  const filteredAppointments = safeAppointments
    .filter(appointment => appointment.status !== 'completed') // Exclude completed appointments
    .filter(appointment => 
      (appointment.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.time?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(filterByDateRange);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAppointments.slice(indexOfFirstRecord, indexOfLastRecord);

  // Get non-completed appointments count for stats
  const nonCompletedAppointments = safeAppointments.filter(a => a.status !== 'completed');

  // Status styling
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#e3f2fd', text: '#1565c0' };
      case 'confirmed': return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'canceled': return { bg: '#ffebee', text: '#c62828' };
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
                fontSize: { xs: '2rem', md: '3.rem' }
              }}
            >
               Rendez-vous
              {isSpecificDateActive && specificDate && (
                <Typography 
                  component="span" 
                  sx={{ 
                    ml: 2, 
                    fontSize: '1rem', 
                    color: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    bgcolor: '#e3f2fd',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 4
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                  {format(specificDate, 'dd MMMM yyyy')}
                  <IconButton 
                    size="small" 
                    onClick={clearDateFilter}
                    sx={{ ml: 0.5, p: 0.2 }}
                  >
                    <CloseIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Typography>
              )}
            </Typography>
            <Tooltip title="Ajouter un rendez-vous">
              <Button 
                variant="contained" 
                startIcon={<EventIcon />}
                onClick={handleAddDialogOpen}
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
                Ajouter Rendez-vous
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
           <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Période</InputLabel>
                <Select
                  value={selectedFilter}
                  onChange={handlePeriodFilterChange}
                  label="Période"
                  disabled={isSpecificDateActive}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="day">Aujourd'hui</MenuItem>
                  <MenuItem value="week">Cette semaine</MenuItem>
                  <MenuItem value="month">Ce mois</MenuItem>
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => setOpenDatePicker(true)}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      borderColor: isSpecificDateActive ? 'primary.main' : 'grey.300',
                      color: isSpecificDateActive ? 'primary.main' : 'grey.700',
                      height: '40px'
                    }}
                  >
                    Date spécifique
                  </Button>
                  <Dialog open={openDatePicker} onClose={() => setOpenDatePicker(false)}>
                    <DialogTitle>Sélectionner une date</DialogTitle>
                    <DialogContent>
                      <DatePicker
                        label="Date"
                        value={specificDate}
                        onChange={handleDateSelect}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth margin="normal" />
                        )}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpenDatePicker(false)}>Annuler</Button>
                      <Button 
                        onClick={() => {
                          if (specificDate) handleDateSelect(specificDate);
                        }}
                        color="primary"
                      >
                        Confirmer
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              </LocalizationProvider>
              
             
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${nonCompletedAppointments.length}`} 
                variant="outlined" 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }} 
              />
              <Chip 
                label={`Pending: ${nonCompletedAppointments.filter(a => a.status === 'pending').length}`} 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  bgcolor: '#e3f2fd',
                  color: '#1565c0'
                }} 
              />
              <Chip 
                label={`Confirmed: ${nonCompletedAppointments.filter(a => a.status === 'confirmed').length}`} 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  bgcolor: '#e8f5e9',
                  color: '#2e7d32'
                }} 
              />
              <Chip 
                label={`Cancelled: ${nonCompletedAppointments.filter(a => a.status === 'canceled').length}`} 
                sx={{ 
                  borderRadius: 4,
                  fontWeight: 500,
                  bgcolor: '#ffebee',
                  color: '#c62828'
                }} 
              />
            </Box>
            
          </Box>

          {status === 'loading' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Chargement des rendez-vous...</Typography>
            </Box>
          )}
          {status === 'failed' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="error">Erreur: {typeof appointmentError === 'object' ? appointmentError.message : appointmentError}</Typography>
            </Box>
          )}
          {patientsError && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="error">Erreur patients: {typeof patientsError === 'object' ? patientsError.message : patientsError}</Typography>
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
                    <TableCell align='center' >Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align='center'>Statut</TableCell>
                    <TableCell align='center' >Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((appointment, index) => {
                      const statusStyle = getStatusColor(appointment.status);
                      const patientName = appointment.patient?.firstName 
                        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                        : 'Patient Inconnu';

                      return (
                        <TableRow
                          key={appointment._id}
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
                                alt={patientName}
                                src={appointment.patient?.image || ''}
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                {patientName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={550}>
                                  {patientName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.patient?.email || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography align='center' variant="body2" fontWeight={500 }  >
                              {appointment.date.split('T')[0]}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.time || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'N/A'}
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
                            <Box sx={{  marginRight:'60px', gap: 1 }}>
                              <Tooltip title="Voir détails">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewAppointment(appointment)}
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
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {isSpecificDateActive && specificDate
                            ? `Pas de rendez-vous pour le ${format(specificDate, 'dd MMMM yyyy')}`
                            : 'Pas de rendez-vous'
                          }
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
              Affichage {currentRecords.length} sur {filteredAppointments.length} rendez-vous
            </Typography>
            <Pagination
              count={Math.ceil(filteredAppointments.length / recordsPerPage)}
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
<GlobalAppointmentModal
  open={openAddDialog}
  onClose={() => setOpenAddDialog(false)}
  patients={patients}
  onAppointmentAdded={refreshAppointments} // Add this prop

/>

     
    </>
  );
};

export default RendezVous;