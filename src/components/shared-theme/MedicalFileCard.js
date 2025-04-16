import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointmentsWithDetails } from "../../Redux/slices/appointmentSlice"; // Adjust path as needed
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Link,
  Stack,
  Paper,
  Avatar,
  CircularProgress,
  Pagination, // Import Pagination
} from "@mui/material";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const PAGE_SIZE = 5;

const MedicalFileCard = ({ patientId }) => {
  const dispatch = useDispatch();
  const { detailedAppointments, loading, error } = useSelector((state) => state.appointments);
  const [currentPage, setCurrentPage] = useState(1); // Change to currentPage
  const [expandedCards, setExpandedCards] = useState({});

  // Fetch detailed appointments when component mounts or patientId changes
  useEffect(() => {
    if (patientId) {
      dispatch(fetchAppointmentsWithDetails(patientId));
    }
  }, [dispatch, patientId]);

  // Pagination logic
  const completedAppointments = detailedAppointments.filter(
    (appointment) => appointment.status === "completed"
  );
  
  const totalPages = Math.ceil(completedAppointments.length / PAGE_SIZE);
  const paginatedAppointments = completedAppointments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  

  const toggleExpand = (appointmentId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [appointmentId]: !prev[appointmentId],
    }));
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const hasContent = (items) => items && items.length > 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">Erreur lors du chargement des rendez-vous</Typography>
        <Typography variant="body2">{error.message || JSON.stringify(error)}</Typography>
      </Box>
    );
  }

  if (!detailedAppointments || detailedAppointments.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Aucun rendez-vous trouvé</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Title Section */}
      <Box
        sx={{
          background: "linear-gradient(145deg, #f5f7fa 0%, #e4e9f2 100%)",
          py: 2,
          px: 3,
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #eaecef",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" fontWeight="700">
          Medical History
        </Typography>
      </Box>

      {/* Content Section */}
      <CardContent sx={{ p: 3 }}>
        {paginatedAppointments.map((appointment) => {
          const isExpanded = expandedCards[appointment._id] || false;
          return (
            <Box key={appointment._id} sx={{ mb: 3 }}>
              <Box
                sx={{
                  py: 1.5,
                  px: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #eaecef",
                  cursor: "pointer",
                }}
                onClick={() => toggleExpand(appointment._id)}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {appointment.type || "Rendez-vous"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "#666",
                      }}
                    >
                      <CalendarTodayOutlinedIcon
                        sx={{ fontSize: 14, mr: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        {formatDate(appointment.date)}
                      </Typography>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="body2">
                        {appointment.time || "Non précisé"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton
                  sx={{ color: "#555" }}
                  aria-expanded={isExpanded}
                  aria-label="show more"
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent sx={{ px: 3, py: 2.5 }}>
                <Grid container spacing={3}>
  {/* Notes */}
  <Grid item xs={12} md={6}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <NoteAltOutlinedIcon sx={{ mr: 1, color: "#555" }} />
        <Typography variant="subtitle1" fontWeight="600">
          Notes
        </Typography>
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      {hasContent(appointment.notes) ? (
        <Stack spacing={1.5}>
          {appointment.notes.map((note, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2">{note.titre}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {note.content}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Aucune note disponible.
        </Typography>
      )}
    </Paper>
  </Grid>

  {/* Prescriptions */}
  <Grid item xs={12} md={6}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f0f7ff",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <MedicationOutlinedIcon sx={{ mr: 1, color: "#0d47a1" }} />
        <Typography variant="subtitle1" fontWeight="600" color="#0d47a1">
          Prescriptions
        </Typography>
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      {hasContent(appointment.prescriptions) ? (
        <Stack spacing={1}>
          {appointment.prescriptions.map((prescription, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                border: "1px solid #bbdefb",
              }}
            >
              
              <Chip
                label={prescription.description}
                size="small"
                sx={{
                  mt: 0.8,
                  height: 20,
                  fontSize: "0.7rem",
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                }}
              />
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Aucune prescription disponible.
        </Typography>
      )}
    </Paper>
  </Grid>

  {/* Diets */}
  <Grid item xs={12} md={6}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f1f8e9",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <RestaurantOutlinedIcon sx={{ mr: 1, color: "#2e7d32" }} />
        <Typography variant="subtitle1" fontWeight="600" color="#2e7d32">
          Régime Alimentaire
        </Typography>
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      {hasContent(appointment.diets) ? (
        <Stack spacing={1.5}>
          {appointment.diets.map((diet, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                border: "1px solid #c5e1a5",
              }}
            >
              <Typography variant="body2" fontWeight="500">
                {diet.dietType}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {diet.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Aucun régime alimentaire disponible.
        </Typography>
      )}
    </Paper>
  </Grid>

  {/* Documents */}
  <Grid item xs={12} md={6}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#fff8e1",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <AttachFileOutlinedIcon sx={{ mr: 1, color: "#e65100" }} />
        <Typography variant="subtitle1" fontWeight="600" color="#e65100">
          Documents
        </Typography>
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      {hasContent(appointment.documents) ? (
        <Stack spacing={1}>
          {appointment.documents.map((doc, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                border: "1px solid #ffe082",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" fontWeight="500">
                {doc.title}
              </Typography>
              <Link
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "flex", color: "#f57c00" }}
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
              </Link>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Aucun document disponible.
        </Typography>
      )}
    </Paper>
  </Grid>
</Grid>
                </CardContent>
              </Collapse>
            </Box>
          );
        })}
        {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
          />
        </Box>
      )}
      </CardContent>

      
    </Card>
  );
};

export default MedicalFileCard;