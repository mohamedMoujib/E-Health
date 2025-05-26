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
  LinearProgress,
  Tooltip,
  CircularProgress,
  Badge
} from "@mui/material";
import {
  NoteAdd,
  LocalPharmacy,
  Restaurant,
  FileCopy,
  
  Cancel,
  CheckCircle,
  Person,
  ArrowBack,
  CloudUpload,
  Event,
  Schedule,
  Description,
  MedicalInformation,
  Fastfood
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientById } from "../Redux/slices/patientsSlice";
import { fetchAppointmentDetails, updateAppointmentStatus } from "../Redux/slices/medicalFileSlice";
import { useParams, useNavigate } from "react-router-dom";
import { 
  addNote, 
  addPrescription, 
  addDiet, 
  addDocument 
} from "../Redux/slices/medicalFileSlice";
import RescheduleModal from "../components/RescheduleModal";

const AppointmentManagement = ({ appointment }) => {
  const location = useLocation();
  const { patientId } = useParams();
  const appointmentId = location.state?.appointment?._id;
  const dispatch = useDispatch();
  const currentPatient = useSelector((state) => state.patients.currentPatient);
  const currentAppointment = useSelector((state) => state.medicalFile.currentAppointment);
  const { loading, error } = useSelector((state) => state.medicalFile);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

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

  // Color Palette
  const colors = {
    primary: '#0A192F',
    secondary: '#5D9CEC',
    accent: '#4A90E2',
    background: '#F5F7FA',
    text: '#2C3E50',
    lightText: '#6c757d',
    error: '#E74C3C',
    success: '#2ECC71',
    warning: '#FFA726',
    info: '#29B6F6'
  };

  // Fetch appointment details when component mounts or appointmentId changes
  useEffect(() => {
    if (location.state?.appointment) {
      dispatch(fetchAppointmentDetails(location.state.appointment._id));
    } else if (appointmentId) {
      dispatch(fetchAppointmentDetails(appointmentId));
    }
  }, [dispatch, appointmentId, location.state]);

  // Update local state when appointment details are fetched
  useEffect(() => {
    if (currentAppointment) {
      setNotes(currentAppointment.notes || []);
      setPrescriptions(currentAppointment.prescriptions || []);
      setDietPlans(currentAppointment.dietPlans || []);
      setDocuments(Array.isArray(currentAppointment.documents) ? currentAppointment.documents : []);
    }
  }, [currentAppointment]);

  // Fetch patient details
  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [dispatch, patientId]);

  // Loading and error states
  if (loading) return (
    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress size={60} sx={{ color: colors.primary }} />
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#fff8f8', borderLeft: `4px solid ${colors.error}` }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Appointment
        </Typography>
        <Typography>{error.message || 'Failed to load appointment details'}</Typography>
        <Button 
          variant="outlined" 
          color="error" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Paper>
    </Container>
  );
  
  if (!currentAppointment) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          No Appointment Found
        </Typography>
        <Typography>We couldn't find the requested appointment.</Typography>
      </Paper>
    </Container>
  );

  const sectionStyles = {
    base: {
      color: colors.primary,
      fontWeight: 600,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
  };

  const customButtonStyle = {
    textTransform: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: 600,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdateError(null);
      const resultAction = await dispatch(updateAppointmentStatus({
        appointmentId: currentAppointment._id,
        status: newStatus
      }));

      if (updateAppointmentStatus.fulfilled.match(resultAction)) {
        // Optional: Show success notification
      } else {
        setStatusUpdateError(resultAction.payload?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setStatusUpdateError(error.message || 'An unexpected error occurred');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      if (fileType.startsWith("image/") || fileType === "application/pdf") {
        setNewDocument((prev) => ({ ...prev, file }));
      } else {
        alert("Only image and PDF files are allowed.");
      }
    }
  };

  const handleAddNote = () => {
    if (newNote.titre && newNote.content) {
      dispatch(addNote({ ...newNote, appointmentId }));
      setNotes([...notes, newNote]);
      setNewNote({ titre: "", content: "" });
    }
  };

  const handleAddPrescription = () => {
    if (newPrescription) {
      dispatch(addPrescription({ description: newPrescription, appointmentId }));
      setPrescriptions([...prescriptions, newPrescription]);
      setNewPrescription("");
    }
  };

  const handleAddDiet = () => {
    if (dietPlan.dietType && dietPlan.description) {
      dispatch(addDiet({ ...dietPlan, appointmentId }));
      setDietPlans([...dietPlans, dietPlan]);
      setDietPlan({ dietType: "", description: "" });
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file && newDocument.title) {
      dispatch(addDocument({ 
        ...newDocument, 
        appointmentId 
      }));
      const documentEntry = {
        title: newDocument.title,
        description: newDocument.description,
        fileName: newDocument.file.name,
        fileType: newDocument.file.type
      };

      const updatedDocuments = [...documents, documentEntry];
      setDocuments(updatedDocuments);

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

const rendreSection = () => {
  switch (activeSection) {
    case "notes":
      return (
        <Box>
          <Typography variant="h6" sx={sectionStyles.base}>
            <Description /> Notes de Patient 
          </Typography>
          
          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <TextField
              fullWidth
              label="Titre"
              value={newNote.titre}
              onChange={(e) => setNewNote({ ...newNote, titre: e.target.value })}
              sx={{ mb: 2 }}
              variant="outlined"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Contenu"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              variant="outlined"
            />
            <Button
              onClick={handleAddNote} 
              disabled={loading || !newNote.titre || !newNote.content}
              sx={{ 
                ...customButtonStyle, 
                mt: 2, 
                backgroundColor: colors.primary,
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
              variant="contained"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ajouter Note'}
            </Button>
          </Paper>

          <Typography variant="subtitle1" sx={{ mb: 2, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
            <NoteAdd /> Notes Existantes ({notes.length})
          </Typography>
          
          {notes.length > 0 ? (
            <Stack spacing={2}>
              {notes.map((note, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${colors.primary}`,
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                    {note.titre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {note.content}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.lightText }}>
                    Ajoutée le {new Date().toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="textSecondary">
                Aucune note ajoutée. Ajoutez votre première note ci-dessus.
              </Typography>
            </Paper>
          )}
        </Box>
      );
    
    case "prescriptions":
      return (
        <Box>
          <Typography variant="h6" sx={sectionStyles.base}>
            <MedicalInformation /> Ordonnances
          </Typography>
          
          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <TextField
              label="Détails de l'Ordonnance"
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Entrez les détails du médicament, la posologie, la fréquence, etc."
            />
            <Button
              onClick={handleAddPrescription} 
              disabled={loading || !newPrescription}
              sx={{ 
                ...customButtonStyle, 
                mt: 2, 
                backgroundColor: colors.primary,
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
              variant="contained"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ajouter Ordonnance'}
            </Button>
          </Paper>

          <Typography variant="subtitle1" sx={{ mb: 2, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPharmacy /> Ordonnances Existantes ({prescriptions.length})
          </Typography>
          
          {prescriptions.length > 0 ? (
            <Stack spacing={2}>
              {prescriptions.map((prescription, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${colors.info}`,
                    backgroundColor: '#f0f8ff'
                  }}
                >
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {prescription.description}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.lightText }}>
                    Prescrite le {new Date().toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="textSecondary">
                Aucune ordonnance ajoutée. Ajoutez votre première ordonnance ci-dessus.
              </Typography>
            </Paper>
          )}
        </Box>
      );
    
    case "diet":
      return (
        <Box>
          <Typography variant="h6" sx={sectionStyles.base}>
            <Fastfood /> Plan Alimentaire
          </Typography>
          
          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <TextField
              fullWidth
              label="Type de Régime"
              value={dietPlan.dietType}
              onChange={(e) => setDietPlan({ ...dietPlan, dietType: e.target.value })}
              sx={{ mb: 2 }}
              variant="outlined"
              placeholder="ex: Faible en glucides, Keto, Végétarien"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={dietPlan.description}
              onChange={(e) => setDietPlan({ ...dietPlan, description: e.target.value })}
              variant="outlined"
              placeholder="Plan alimentaire détaillé, restrictions, suggestions de repas"
            />
            <Button
              onClick={handleAddDiet} 
              disabled={loading || !dietPlan.dietType || !dietPlan.description}
              sx={{ 
                ...customButtonStyle, 
                mt: 2, 
                backgroundColor: colors.primary,
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
              variant="contained"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ajouter Plan Alimentaire'}
            </Button>
          </Paper>

          <Typography variant="subtitle1" sx={{ mb: 2, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant /> Plans Alimentaires Existants ({dietPlans.length})
          </Typography>
          
          {dietPlans.length > 0 ? (
            <Stack spacing={2}>
              {dietPlans.map((diet, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${colors.success}`,
                    backgroundColor: '#f0fff4'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 'bold' }}>
                    {diet.dietType}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {diet.description}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.lightText }}>
                    Créé le {new Date().toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="textSecondary">
                Aucun plan alimentaire ajouté. Ajoutez votre premier plan alimentaire ci-dessus.
              </Typography>
            </Paper>
          )}
        </Box>
      );
    
    case 'documents':
      return (
        <Box>
          <Typography variant="h6" sx={sectionStyles.base}>
            <FileCopy /> Documents
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: colors.text }}>
              Télécharger un Nouveau Document
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Titre du Document"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                required
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Description du Document"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                variant="outlined"
              />
              
              <Box>
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
                  Sélectionner Fichier
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf" 
                    onChange={handleDocumentUpload}
                  />
                </Button>
                
                {newDocument.file && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      Sélectionné: {newDocument.file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ({Math.round(newDocument.file.size / 1024)} KB)
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Button 
                variant="contained" 
                onClick={handleAddDocument}
                disabled={!newDocument.file || !newDocument.title || loading}
                sx={{ 
                  ...customButtonStyle,
                  backgroundColor: colors.primary, 
                  '&:hover': { backgroundColor: colors.secondary },
                  '&.Mui-disabled': {
                    backgroundColor: '#e0e0e0'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Télécharger Document'}
              </Button>
            </Stack>
          </Paper>

          <Typography variant="subtitle1" sx={{ mb: 2, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileCopy /> Documents Existants ({documents.length})
          </Typography>
          
          {documents.length > 0 ? (
            <Grid container spacing={2}>
              {documents.map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: `1px solid #e0e0e0`,
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: colors.primary,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => {
                      const fileUrl = doc.fileUrl || doc.file || doc.url;
                      if (fileUrl) {
                        window.open(fileUrl, '_blank');
                      } else {
                        alert("Aucun fichier disponible pour ce document.");
                      }
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {doc.fileType?.startsWith('image/') ? (
                          <Description color="primary" />
                        ) : (
                          <Description color="secondary" />
                        )}
                        <Typography variant="subtitle1" sx={{ color: colors.primary, fontWeight: 500 }}>
                          {doc.title}
                        </Typography>
                      </Box>
                      
                      {doc.description && (
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {doc.description}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" sx={{ color: colors.lightText }}>
                        {doc.fileName}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="textSecondary">
                Aucun document téléchargé.
              </Typography>
            </Paper>
          )}
        </Box>
      );
    
    default:
      return (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={sectionStyles.base}>
              <Event /> Aperçu du Rendez-vous
            </Typography>
            <Chip 
              label={currentAppointment.status.toUpperCase()} 
              color={getStatusColor(currentAppointment.status)}
              sx={{ 
                fontWeight: 600,
                letterSpacing: 0.5
              }}
            />
          </Box>
          
          <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Stack spacing={3}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar 
                  src={currentPatient.image} 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: `2px solid ${colors.primary}` 
                  }}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
                    {currentPatient.firstName} {currentPatient.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.lightText }}>
                    ID Patient: {patientId}
                  </Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Event sx={{color:colors.primary}} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: colors.lightText }}>
                        Date du Rendez-vous
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                        {new Date(currentAppointment.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Schedule sx={{color:colors.primary}} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: colors.lightText }}>
                        Heure du Rendez-vous
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                        {currentAppointment.time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              {statusUpdateError && (
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#fff0f0', borderLeft: `4px solid ${colors.error}` }}>
                  <Typography color="error">{statusUpdateError}</Typography>
                </Paper>
              )}
              
              <Box>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <Tooltip title="Confirmer ce rendez-vous">
                    <Button 
                      variant="contained" 
                      startIcon={<CheckCircle />}
                      disabled={currentAppointment.status === 'confirmed'}
                      sx={{ 
                        ...customButtonStyle,
                        backgroundColor: colors.success,
                        '&:hover': { backgroundColor: '#1e9c65' },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#a0a0a0'
                        }
                      }}
                      onClick={() => handleStatusUpdate('confirmed')}
                    >
                      Confirmer
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Marquer comme terminé">
                    <Button 
                      variant="contained" 
                      startIcon={<CheckCircle />}
                      disabled={currentAppointment.status === 'completed'}
                      sx={{ 
                        ...customButtonStyle,
                        backgroundColor: colors.primary,
                        '&:hover': { backgroundColor: '#1565c0' },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#a0a0a0'
                        }
                      }}
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      Terminer
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Annuler ce rendez-vous">
                    <Button 
                      variant="contained" 
                      startIcon={<Cancel />}
                      disabled={currentAppointment.status === 'canceled'}
                      sx={{ 
                        ...customButtonStyle,
                        backgroundColor: colors.error,
                        '&:hover': { backgroundColor: '#c62828' },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#a0a0a0'
                        }
                      }}
                      onClick={() => handleStatusUpdate('canceled')}
                    >
                      Annuler
                    </Button>
                  </Tooltip>
                  <Tooltip title="Reprogrammer ce rendez-vous">
                    <Button 
                      variant="contained" 
                      startIcon={<Event />}
                      disabled={['canceled', 'completed'].includes(currentAppointment.status)}
                      sx={{ 
                        ...customButtonStyle,
                        backgroundColor: colors.warning,
                        '&:hover': { backgroundColor: '#ff9800' },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#a0a0a0'
                        }
                      }}
                      onClick={() => setRescheduleOpen(true)}
                    >
                      Reprogrammer
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </Paper>
          
          <Typography variant="h6" sx={{ ...sectionStyles.base, mt: 4 }}>
            Actions Rapides
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<NoteAdd />}
                onClick={() => setActiveSection('notes')}
                sx={{ 
                  ...customButtonStyle,
                  height: '100%',
                  py: 3,
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary
                  }
                }}
              >
                Ajouter Note
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalPharmacy />}
                onClick={() => setActiveSection('prescriptions')}
                sx={{ 
                  ...customButtonStyle,
                  height: '100%',
                  py: 3,
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary
                  }
                }}
              >
                Ajouter Ordonnance
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Restaurant />}
                onClick={() => setActiveSection('diet')}
                sx={{ 
                  ...customButtonStyle,
                  height: '100%',
                  py: 3,
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary
                  }
                }}
              >
                Ajouter Plan Alimentaire
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileCopy />}
                onClick={() => setActiveSection('documents')}
                sx={{ 
                  ...customButtonStyle,
                  height: '100%',
                  py: 3,
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary
                  }
                }}
              >
                Télécharger Document
              </Button>
            </Grid>
          </Grid>
        </Box>
      );
  }
};

  const elementsBareNavigation = [
  { label: 'Aperçu', icon: <Person />, section: 'overview', badge: 0 },
  { label: 'Notes', icon: <NoteAdd />, section: 'notes', badge: notes.length },
  { label: 'Ordonnances', icon: <LocalPharmacy />, section: 'prescriptions', badge: prescriptions.length },
  { label: 'Plan Alimentaire', icon: <Restaurant />, section: 'diet', badge: dietPlans.length },
  { label: 'Documents', icon: <FileCopy />, section: 'documents', badge: documents.length },
];

return (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    <Grid container spacing={3}>
      {/* Navigation Latérale */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2,
            height: '100%',
            border: `1px solid #e0e0e0`,
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            backgroundColor: 'white'
          }}
        >
          <Tooltip title="Retour au profil patient">
            <IconButton 
              onClick={onNavigateBack} 
              sx={{ 
                mb: 2,
                backgroundColor: `${colors.primary}10`,
                '&:hover': { 
                  backgroundColor: `${colors.primary}20` 
                } 
              }}
            >
              <ArrowBack sx={{ color: colors.primary }} />
            </IconButton>
          </Tooltip>
          
          <Typography variant="subtitle1" sx={{ mb: 2, color: colors.primary, fontWeight: 600 }}>
            Sections du Rendez-vous
          </Typography>
          
          <Stack spacing={1}>
            {elementsBareNavigation.map((item) => (
              <Tooltip key={item.section} title={item.label} placement="right">
                <Button
                  fullWidth
                  startIcon={item.icon}
                  onClick={() => setActiveSection(item.section)}
                  sx={{
                    ...customButtonStyle,
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    color: activeSection === item.section ? 'white' : colors.text,
                    backgroundColor: activeSection === item.section ? colors.primary : 'transparent',
                    '&:hover': {
                      backgroundColor: activeSection === item.section ? colors.primary : `${colors.primary}10`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <Chip 
                        label={item.badge} 
                        size="small" 
                        sx={{ 
                          backgroundColor: activeSection === item.section ? 'white' : `${colors.primary}20`,
                          color: activeSection === item.section ? colors.primary : colors.text,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                </Button>
              </Tooltip>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* Zone de Contenu Principal */}
      <Grid item xs={12} md={9}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 4 },
            minHeight: '70vh',
            border: `1px solid #e0e0e0`,
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            backgroundColor: 'white'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <CircularProgress size={60} sx={{ color: colors.primary }} />
            </Box>
          ) : (
            rendreSection()
          )}
        </Paper>
      </Grid>
    </Grid>
    <RescheduleModal
      open={rescheduleOpen}
      onClose={() => setRescheduleOpen(false)}
      onSuccess={() => {
        dispatch(fetchAppointmentDetails(appointmentId));
      }}
      appointment={currentAppointment}
      patientId={patientId}
    />
  </Container>
);
};

export default AppointmentManagement;
