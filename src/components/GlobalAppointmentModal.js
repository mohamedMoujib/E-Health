import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Radio,
  FormControlLabel,
  RadioGroup,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  styled,
  Chip,
  Fade,
  createTheme,
  ThemeProvider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { Calendar as MuiCalendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isToday, isWeekend, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch, useSelector } from "react-redux";
import { bookAppointment, getAvailableSlots, fetchAppointmentsByPatient } from "../Redux/slices/appointmentSlice"; // Adjust path

// Custom theme with enhanced colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#0A192F",
      light: "#1D2F4D",
      dark: "#060F1A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFA000",
      contrastText: "#000000",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    body1: {
      fontWeight: 500,
    },
    body2: {
      fontWeight: 400,
    },
  },
});

// Styled components
const StyledCalendar = styled(MuiCalendar)(() => ({
  width: "100%",
  maxWidth: "1000px",
  margin: "0 auto",
  border: "none",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: "none",
  fontFamily: theme.typography.fontFamily,
  ".react-calendar__month-view__weekdays": {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)", // Ensure 7 columns for weekdays
    textAlign: "center",
  },
  ".react-calendar__month-view__days": {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)", // Ensure 7 columns for days
    textAlign: "center",
  },
  ".react-calendar__tile": {
    padding: "16px 6px ",
    borderRadius: "12px",
    fontWeight: "bold",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },
  ".react-calendar__tile--active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const TimeSlotButton = styled(Button)(({ selected }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: "12px",
  transition: "all 0.2s ease",
  fontWeight: "bold",
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: selected ? "none" : `1px solid ${theme.palette.divider}`,
  boxShadow: selected ? theme.shadows[2] : "none",
  "&:hover": {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
    transform: "translateY(-2px)",
  },
}));

const StyledSelect = styled(Select)(() => ({
  borderRadius: "12px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.light,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StepContainer = styled(Paper)(() => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  marginBottom: theme.spacing(2),
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
  },
}));

const StepTitle = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const ConfirmButton = styled(Button)(() => ({
  borderRadius: "12px",
  padding: theme.spacing(1.5),
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: theme.shadows[4],
  transition: "all 0.3s ease",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export default function GlobalAppointmentModal({ patients = [], open, onClose, onAppointmentAdded }) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [summary, setSummary] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.appointments);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!open) {
      // Reset the component state when modal closes
      setTimeout(() => {
        setSummary(false);
        setSelectedPatientId("");
        setSelectedDate(new Date());
        setSelectedTime(null);
        setAppointmentType("Consultation");
        setAvailableSlots([]);
      }, 300); // Small delay to ensure animation completes first
    }
  }, [open]);

  // Fetch available slots when the date changes AND a patient is selected
  useEffect(() => {
    if (selectedDate && open && selectedPatientId) {
      dispatch(getAvailableSlots(format(selectedDate, "yyyy-MM-dd")))
        .unwrap()
        .then((response) => {
          const slots = response.availableSlots || response;
          
          if (Array.isArray(slots)) {
            setAvailableSlots(slots);
          } else {
            console.error("Expected array of slots but received:", slots);
            setAvailableSlots([]);
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des créneaux:", err);
          setAvailableSlots([]); // Reset to empty array on error
        });
    }
  }, [dispatch, selectedDate, selectedPatientId, open]);

  // This function will filter time slots based on the current time
  const filterAvailableSlots = (slots, selectedDate) => {
    // Only apply filtering if the selected date is today
    if (!isToday(selectedDate)) {
      return slots;
    }
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    return slots.filter(slot => {
      // Parse the time slot (assuming format like "09:00" or "14:30")
      const [hours, minutes] = slot.split(':').map(Number);
      
      // If hours are greater, the slot is definitely later
      if (hours > currentHour) return true;
      
      // If hours are the same, check minutes
      if (hours === currentHour && minutes > currentMinute) return true;
      
      // Otherwise, the slot is in the past
      return false;
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handlePatientChange = (event) => {
    setSelectedPatientId(event.target.value);
    // Reset time when patient changes
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (summary) {
      // Get patient details from the list
      const selectedPatient = patients.find(patient => patient.id === selectedPatientId);
      
      const appointmentData = {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        type: appointmentType,
        patientId: selectedPatientId,
      };
      
      console.log("Submitting appointment:", appointmentData);
      
      dispatch(bookAppointment(appointmentData))
        .unwrap()
        .then(() => {
          console.log("Rendez-vous confirmé :", appointmentData);
          dispatch(fetchAppointmentsByPatient(selectedPatientId)); 
          onAppointmentAdded();

          onClose(); // Close modal
        })
        .catch((err) => {
          console.error("Erreur lors de la réservation du rendez-vous :", err);
        });
    } else {
      setSummary(true);
    }
  };
  
  const handleBack = () => {
    setSummary(false);
  };

  const tileDisabled = ({ date }) => {
    const today = new Date();
    const maxDate = addDays(today, 360);
    return date < today || date > maxDate;
  };

  const formatDateDisplay = (date) => {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  // Get selected patient details
  const selectedPatient = patients.find(patient => patient.id === selectedPatientId) || {};
  

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            overflow: "hidden",
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center">
            <EventIcon sx={{ mr: 1.5 }} />
            <Typography variant="h5" fontWeight="bold">
              {summary ? "Résumé du Rendez-vous" : "Planifier un Rendez-vous"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {!summary ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <StepContainer elevation={0}>
                <StepTitle>
                  <PersonIcon fontSize="medium" />
                  <Typography variant="h6" fontWeight="bold">
                    Sélectionnez un patient
                  </Typography>
                </StepTitle>
                
                {/* Patient selection dropdown with explicit value handling */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="patient-select-label">Patient</InputLabel>
                  <StyledSelect
                    labelId="patient-select-label"
                    id="patient-select"
                    value={selectedPatientId}
                    onChange={handlePatientChange}
                    label="Patient"
                  >
                    {patients && patients.length > 0 ? (
                      patients.map((patient) => (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        Aucun patient disponible
                      </MenuItem>
                    )}
                  </StyledSelect>
                  {!selectedPatientId && (
                    <FormHelperText>Veuillez sélectionner un patient</FormHelperText>
                  )}
                </FormControl>
                
                {/* Debug info - can be removed in production */}
                {selectedPatientId && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block" }}>
                    Patient sélectionné: ID {selectedPatientId}
                  </Typography>
                )}
              </StepContainer>
              
              <StepContainer elevation={0}>
                <StepTitle>
                  <EventIcon fontSize="medium" />
                  <Typography variant="h6" fontWeight="bold">
                    Sélectionnez une date
                  </Typography>
                </StepTitle>
                {isToday(selectedDate) && (
                  <Chip
                    label="Aujourd'hui"
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}
                <StyledCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  tileDisabled={tileDisabled}
                  locale="fr-FR"
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 360)}
                />
              </StepContainer>
              
              <StepContainer elevation={0}>
                <StepTitle>
                  <AccessTimeIcon fontSize="medium" />
                  <Typography variant="h6" fontWeight="bold">
                    Sélectionnez un créneau
                  </Typography>
                </StepTitle>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {formatDateDisplay(selectedDate)}
                  </Typography>
                </Box>
                {!selectedPatientId ? (
                  <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
                    Veuillez d'abord sélectionner un patient
                  </Typography>
                ) : loading ? (
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    Chargement des créneaux disponibles...
                  </Typography>
                ) : error ? (
                  <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
                    Erreur lors de la récupération des créneaux.
                  </Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={1.5} mt={2}>
                    {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                      (() => {
                        // Filter available slots if today
                        const filteredSlots = filterAvailableSlots(availableSlots, selectedDate);
                        
                        if (filteredSlots.length === 0) {
                          return (
                            <Typography color="info.main" sx={{ mt: 2, textAlign: "center", width: "100%" }}>
                              Tous les créneaux d'aujourd'hui sont déjà passés.
                            </Typography>
                          );
                        }
                        
                        return filteredSlots.map((slot) => (
                          <TimeSlotButton
                            key={slot}
                            selected={selectedTime === slot}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </TimeSlotButton>
                        ));
                      })()
                    ) : (
                      <Typography color="error" sx={{ mt: 2, textAlign: "center", width: "100%" }}>
                        Aucun créneau disponible pour cette date.
                      </Typography>
                    )}
                  </Box>
                )}
              </StepContainer>
              
              <StepContainer elevation={0}>
                <StepTitle>
                  <LocalHospitalIcon fontSize="medium" />
                  <Typography variant="h6" fontWeight="bold">
                    Type de rendez-vous
                  </Typography>
                </StepTitle>
                <RadioGroup
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  sx={{ ml: 1 }}
                >
                  <FormControlLabel
                    value="Consultation"
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1" fontWeight="medium">
                        Consultation (première visite)
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="controle"
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1" fontWeight="medium">
                        Contrôle (suivi)
                      </Typography>
                    }
                  />
                </RadioGroup>
              </StepContainer>
              
              <ConfirmButton
                onClick={handleConfirm}
                disabled={!selectedPatientId || !selectedTime}
                endIcon={<CheckCircleIcon />}
              >
                Continuer
              </ConfirmButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <StepContainer elevation={0}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  Résumé de votre rendez-vous
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PersonIcon sx={{ color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Patient
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EventIcon sx={{ color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDateDisplay(selectedDate)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon sx={{ color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Heure
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocalHospitalIcon sx={{ color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {appointmentType === "Consultation" ? "Consultation (première visite)" : "Contrôle (suivi)"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: theme.palette.primary.light,
                    borderRadius: "12px",
                  }}
                >
                  <Typography variant="body2" color="white">
                    Veuillez vous présenter 10 minutes avant l'heure de votre
                    rendez-vous. N'oubliez pas d'apporter votre carte d'identité et
                    votre dossier médical.
                  </Typography>
                </Box>
              </StepContainer>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    flex: 1,
                    borderRadius: "12px",
                    borderWidth: "2px",
                    p: 1.5,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: "rgba(10, 25, 47, 0.04)",
                    },
                  }}
                >
                  Modifier
                </Button>
                <ConfirmButton
                  onClick={handleConfirm}
                  sx={{ flex: 2 }}
                  endIcon={<CheckCircleIcon />}
                >
                  Confirmer le Rendez-vous
                </ConfirmButton>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}