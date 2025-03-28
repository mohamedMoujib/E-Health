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
import { useDispatch, useSelector } from "react-redux";
import { bookAppointment, getAvailableSlots,fetchAppointmentsByPatient } from "../../Redux/slices/appointmentSlice"; // Adjust path

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

export default function AppointmentModal({  patientId ,open, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [summary, setSummary] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.appointments);

  // Fetch available slots when the date changes
  useEffect(() => {
    if (selectedDate) {
      // Debug: Log the date being sent to the API
      console.log("Fetching slots for date:", format(selectedDate, "yyyy-MM-dd"));
      
      dispatch(getAvailableSlots(format(selectedDate, "yyyy-MM-dd")))
        .unwrap()
        .then((response) => {
          // Debug: Log the entire response
          console.log("API Response:", response);
          
          // Make sure you're accessing the correct property in the response
          // If the response structure is { availableSlots: [...] }
          const slots = response.availableSlots || response;
          
          // Debug: Log the slots after extraction
          console.log("Extracted slots:", slots);
          
          // Ensure slots is an array before updating state
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
  }, [dispatch, selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleConfirm = () => {
    if (summary) {
      const appointmentData = {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        type: appointmentType,
        patientId,
      };
      dispatch(bookAppointment(appointmentData))
        .unwrap()
        .then(() => {
          console.log("Rendez-vous confirmé :", appointmentData);
          dispatch(fetchAppointmentsByPatient(patientId)); 
        
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
              {summary ? "Résumé du Rendez-vous" : "Prendre un Rendez-vous"}
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
                {loading && (
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    Chargement des créneaux disponibles...
                  </Typography>
                )}
                {error && (
                  <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
                    Erreur lors de la récupération des créneaux.
                  </Typography>
                )}
                                {!loading && !error && (
                <Box display="flex" flexWrap="wrap" gap={1.5} mt={2}>
                    {console.log("Rendering with availableSlots:", availableSlots)}
                    {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                        <TimeSlotButton
                        key={slot}
                        selected={selectedTime === slot}
                        onClick={() => setSelectedTime(slot)}
                        >
                        {slot}
                        </TimeSlotButton>
                    ))
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
                disabled={!selectedTime}
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