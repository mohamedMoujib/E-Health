import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import {
  NoteAdd,
  LocalPharmacy,
  Restaurant,
  FileCopy,
  Delete,
  Cancel,
  CheckCircle,
  Person,
  ArrowBack,
  CloudUpload,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientById } from "../Redux/slices/patientsSlice";
import { fetchAppointmentDetails ,updateAppointmentStatus} from "../Redux/slices/medicalFileSlice"; // Import new thunk
import { useParams, useNavigate } from "react-router-dom";
import { 
  addNote, 
  addPrescription, 
  addDiet, 
  addDocument 
} from "../Redux/slices/medicalFileSlice";

const AppointmentManagement = ({ appointment, onUpdate }) => {
  const location = useLocation();
  const { patientId } = useParams();
  const appointmentId = location.state?.appointment?._id;
  const dispatch = useDispatch();
  const currentPatient = useSelector((state) => state.patients.currentPatient);
  const currentAppointment = useSelector((state) => state.medicalFile.currentAppointment);
  const { loading, error } = useSelector((state) => state.medicalFile);
  const [statusUpdateError, setStatusUpdateError] = useState(null);

  const [activeSection, setActiveSection] = useState('overview');
  
  // State management using both local state and Redux state
  const [notes, setNotes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [newNote, setNewNote] = useState({ titre: "", content: "" });
  const [newPrescription, setNewPrescription] = useState("");
  const [dietPlan, setDietPlan] = useState({ dietType: "", description: "" });
  const [newDocument, setNewDocument] = useState({
    file: null,
    title: "",
    description: ""
  });

  const navigate = useNavigate();

  // Fetch appointment details when component mounts or appointmentId changes
  useEffect(() => {
    if (location.state?.appointment) {
      // If an appointment is passed through navigation state, use it
      dispatch(fetchAppointmentDetails(location.state.appointment._id));
    } else if (appointmentId) {
      // Fallback to using appointmentId from URL params
      dispatch(fetchAppointmentDetails(appointmentId));
    }
  }, [dispatch, appointmentId, location.state]);
  // Update local state when appointment details are fetched
  useEffect(() => {
    if (currentAppointment) {
      setNotes(currentAppointment.notes || []);
      setPrescriptions(currentAppointment.prescriptions || []);
      setDietPlans(currentAppointment.dietPlans || []);
      setDocuments(currentAppointment.documents || []);
    }
  }, [currentAppointment]);

  // Fetch patient details
  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [dispatch, patientId]);

  // Loading and error states
  if (loading) return <Typography>Loading appointment details...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!currentAppointment) return <Typography>No appointment found.</Typography>;


  // Color Palette
  const colors = {
    primary: '#0A192F',
    secondary: '#5D9CEC',
    accent: '#4A90E2',
    background: '#F5F7FA',
    text: '#2C3E50',
    error: '#E74C3C',
    success: '#2ECC71'
  };

  const sectionStyles = {
    base: {
      color: colors.primary,
      fontWeight: 600,
      mb: 2,
    },
  };

  const customButtonStyle = {
    textTransform: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
    }
  };
  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdateError(null);
      const resultAction = await dispatch(updateAppointmentStatus({
        appointmentId: currentAppointment._id,
        status: newStatus
      }));

      // Check if the action was successfully fulfilled
      if (updateAppointmentStatus.fulfilled.match(resultAction)) {
        // Optional: Show a success toast or notification
        console.log('Status updated successfully');
      } else {
        // Handle rejection
        setStatusUpdateError(resultAction.payload?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setStatusUpdateError(error.message || 'An unexpected error occurred');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleAddNote = () => {
    if (newNote.titre && newNote.content) {
      // Dispatch action to add note
      dispatch(addNote({ ...newNote, appointmentId }));
      
      // Add to local state for immediate UI update
      setNotes([...notes, newNote]);
      
      // Reset note fields
      setNewNote({ titre: "", content: "" });
    }
  };

  const handleAddPrescription = () => {
    if (newPrescription) {
      // Dispatch action to add prescription
      dispatch(addPrescription({ description: newPrescription, appointmentId }));
      
      // Add to local state for immediate UI update
      setPrescriptions([...prescriptions, newPrescription]);
      
      // Reset prescription field
      setNewPrescription("");
    }
  };

  const handleAddDiet = () => {
    if (dietPlan.dietType && dietPlan.description) {
      // Dispatch action to add diet
      dispatch(addDiet({ ...dietPlan, appointmentId }));
      
      // Add to local state for immediate UI update
      setDietPlans([...dietPlans, dietPlan]);
      
      // Reset diet plan fields
      setDietPlan({ dietType: "", description: "" });
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file && newDocument.title) {
      // Dispatch action to add document
      dispatch(addDocument({ 
        ...newDocument, 
        appointmentId 
      }));

      // Add to local state for immediate UI update
      const documentEntry = {
        title: newDocument.title,
        description: newDocument.description,
        fileName: newDocument.file.name,
        fileType: newDocument.file.type
      };

      const updatedDocuments = [...documents, documentEntry];
      setDocuments(updatedDocuments);

      // Reset document upload form
      setNewDocument({
        file: null,
        title: "",
        description: ""
      });
    }
  };

  const onNavigateBack = () => {
    navigate(`/dashboard/Patients/${patientId}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "notes":
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
              Patient Notes
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={newNote.titre}
              onChange={(e) => setNewNote({ ...newNote, titre: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <Button
              onClick={handleAddNote} 
              disabled={loading }
              sx={{ ...customButtonStyle, mt: 2, backgroundColor: colors.primary,color: 'white' }}
            >
              Add Note
            </Button>

            {/* Display Added Notes */}
            {notes.length > 0 && (
              <Box mt={3}>
              
                {notes.map((note, index) => (
                  <Paper 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      backgroundColor: `${colors.secondary}10` 
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 'bold' }}>
                      {note.titre}
                    </Typography>
                    <Typography variant="body2">
                      {note.content}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        );
      
      case "prescriptions":
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
              Prescriptions
            </Typography>
            <TextField
              label="Description"
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <Button
              onClick={handleAddPrescription} 
              disabled={loading }
              sx={{ ...customButtonStyle, mt: 2, backgroundColor: colors.primary,color: 'white' }}
            >
              Add Prescription
            </Button>

            {/* Display Added Prescriptions */}
            {prescriptions.length > 0 && (
              <Box mt={3}>
               
                {prescriptions.map((prescription) => (
                  <Paper 
                    key={prescription._id} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      backgroundColor: `${colors.secondary}10` 
                    }}
                  >
                    <Typography variant="body2">
                      {prescription.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        );
      
      case "diet":
        return (
          <Box>
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
              Diet Plan
            </Typography>
            <TextField
              fullWidth
              label="Diet Type"
              value={dietPlan.dietType}
              onChange={(e) => setDietPlan({ ...dietPlan, dietType: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={dietPlan.description}
              onChange={(e) => setDietPlan({ ...dietPlan, description: e.target.value })}
            />
            <Button
              onClick={handleAddDiet} 
              disabled={loading }
              sx={{ ...customButtonStyle, mt: 2, backgroundColor: colors.primary, color: 'white' }}
            >
              Add Diet Plan
            </Button>

            {/* Display Added Diet Plans */}
            {dietPlans.length > 0 && (
              <Box mt={3}>
                
                {dietPlans.map((diet, index) => (
                  <Paper 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      backgroundColor: `${colors.secondary}10` 
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 'bold' }}>
                      {diet.dietType}
                    </Typography>
                    <Typography variant="body2">
                      {diet.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        );
      
      case 'documents':
        return (
          <Box>
            <Typography variant="h6" sx={sectionStyles.base}>Upload Documents</Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Document Title"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    '& fieldset': { borderColor: colors.primary },
                    '&:hover fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Document Description"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                multiline
                rows={3}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    '& fieldset': { borderColor: colors.primary },
                    '&:hover fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ 
                  ...customButtonStyle,
                  backgroundColor: colors.primary, 
                  '&:hover': { backgroundColor: colors.accent } 
                }}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleDocumentUpload}
                />
              </Button>
              {newDocument.file && (
                <Typography variant="body2">
                  Selected: {newDocument.file.name}
                </Typography>
              )}
              <Button 
                variant="contained" 
                onClick={handleAddDocument}
                disabled={!newDocument.file || !newDocument.title}
                sx={{ 
                  ...customButtonStyle,
                  backgroundColor: colors.primary, 
                  '&:hover': { backgroundColor: colors.secondary },
                  '&.Mui-disabled': {
                    backgroundColor: `${colors.primary}80`,
                    color: 'white'
                  }
                }}
              >
                Add Document
              </Button>

              {/* Existing Documents List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={sectionStyles.base}>Existing Documents</Typography>
                {documents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No documents uploaded yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {documents.map((doc, index) => (
                      <Paper 
                        key={index} 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          borderColor: colors.primary,
                          backgroundColor: `${colors.primary}10`
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ color: colors.primary }}>
                          {doc.title}
                        </Typography>
                        <Typography variant="body2">
                          {doc.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          File: {doc.fileName}
                        </Typography>
                        <IconButton 
                          onClick={() => {
                            const updatedDocs = documents.filter((_, i) => i !== index);
                            setDocuments(updatedDocs);
                            onUpdate({ 
                              ...currentAppointment, 
                              documents: updatedDocs 
                            });
                          }}
                          sx={{ color: colors.error, position: 'absolute', top: 0, right: 0 }}
                        >
                          <Delete />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        );
      
      default:
        return (
            <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={sectionStyles.base}>Appointment Overview</Typography>
              <Chip 
                label={currentAppointment.status} 
                color={getStatusColor(currentAppointment.status)}
                variant="outlined"
              />
            </Box>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={currentPatient.image} sx={{ width: 56, height: 56 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    {currentPatient.firstName} {currentPatient.lastName}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Typography variant="body1">
                <strong style={{ color: colors.text }}>Date:</strong> {currentAppointment.date.split('T')[0]}
              </Typography>
              <Typography variant="body1">
                <strong style={{ color: colors.text }}>Time:</strong> {currentAppointment.time} 
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  startIcon={<CheckCircle />}
                  disabled={currentAppointment.status === 'confirmed'}
                  sx={{ 
                    ...customButtonStyle,
                    backgroundColor: colors.success,
                    '&:hover': { backgroundColor: `${colors.success}D0` } 
                  }}
                  onClick={() => handleStatusUpdate('confirmed')}
                >
                  Confirm
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<CheckCircle />}
                  disabled={currentAppointment.status === 'completed'}
                  sx={{ 
                    ...customButtonStyle,
                    backgroundColor: colors.primary,
                    '&:hover': { backgroundColor: colors.secondary } 
                  }}
                  onClick={() => handleStatusUpdate('completed')}
                >
                  Complete
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Cancel />}
                  disabled={currentAppointment.status === 'canceled'}
                  sx={{ 
                    ...customButtonStyle,
                    backgroundColor: colors.error,
                    '&:hover': { backgroundColor: `${colors.error}D0` } 
                  }}
                  onClick={() => handleStatusUpdate('canceled')}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        );
    }
  };

  const sidebarNavItems = [
    { label: 'Overview', icon: <Person />, section: 'overview' },
    { label: 'Notes', icon: <NoteAdd />, section: 'notes' },
    { label: 'Prescriptions', icon: <LocalPharmacy />, section: 'prescriptions' },
    { label: 'Diet Plan', icon: <Restaurant />, section: 'diet' },
    { label: 'Documents', icon: <FileCopy />, section: 'documents' },
  ];

  return (
    <Container maxWidth="lg" sx={{ marginTop:"15px",paddingBottom:"15px",backgroundColor: colors.background }}>
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(58, 110, 165, 0.1)' ,
              borderRadius: "16px", 
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
      }
            }}
          >
            <IconButton 
              onClick={onNavigateBack} 
              sx={{ 
                mb: 2, 
                color: colors.primary,
                '&:hover': { 
                  backgroundColor: `${colors.secondary}10` 
                } 
              }}
            >
              <ArrowBack />
            </IconButton>
            <Stack spacing={1}>
              {sidebarNavItems.map((item) => (
                <Button
                  key={item.section}
                  fullWidth
                  startIcon={item.icon}
                  onClick={() => setActiveSection(item.section)}
                  sx={{
                    ...customButtonStyle,
                    justifyContent: 'flex-start',
                    color: activeSection === item.section ? colors.primary : colors.text,
                    backgroundColor: activeSection === item.section ? `${colors.secondary}20` : 'transparent',
                    '&:hover': {
                      backgroundColor: `${colors.secondary}30`,
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              minHeight: '70vh',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(58, 110, 165, 0.1)' ,
              borderRadius: "16px", 
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
      }
            }}
          >
            {renderSection()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AppointmentManagement;