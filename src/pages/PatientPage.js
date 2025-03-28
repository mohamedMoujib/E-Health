import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import PatientProfileCard from "../components/shared-theme/PatientDetailsCard";
import AppointmentHistoryCard from "../components/shared-theme/AppointmentHistoryCard";
import MedicalFileCard from "../components/shared-theme/MedicalFileCard";
import { fetchPatientsList, setCurrentPatient, fetchPatientById } from "../Redux/slices/patientsSlice";

const PatientPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { list: patientsList, currentPatient: patient, status, error } = useSelector((state) => state.patients);
  const isLoading = status === "loading";

  // Effect to fetch patient by ID if needed
  useEffect(() => {
    console.log("Fetching patient with ID:", patientId);
    if (patientId && (!patient || patient._id !== patientId)) {
      dispatch(fetchPatientById(patientId));
    }
  }, [dispatch, patientId, patient]);
  
  useEffect(() => {
    console.log("Redux state updated: ", { status, error, patient });
  }, [status, error, patient]);
  

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // No patient found state
  if (!patient) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Aucun patient sélectionné
        </Typography>
        <Typography
          variant="body1"
          color="primary"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/dashboard/patients")}
        >
          Retourner à la liste des patients
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: isMobile ? 2 : 4,
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={isMobile ? 2 : 4}>
        {/* Left Column: Patient Profile and Medical File */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: isMobile ? 2 : 4 }}>
            <PatientProfileCard patient={patient} />
            <MedicalFileCard patientId={patient._id} />
          </Box>
        </Grid>

        {/* Right Column: Appointment History */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: isMobile ? 2 : 4 }}>
            <AppointmentHistoryCard patientId={patient._id} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientPage;
