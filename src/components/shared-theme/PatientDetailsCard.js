import React from "react";
import { 
  Card, 
  CardContent, 
  Avatar, 
  Typography,
  Box, 
  Chip, 
  Button,
  Grid,
  Divider,
  Stack,
  Dialog,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useState } from "react";
import AppointmentModal from "./AppointmentModal";

const PatientProfileCard = ({ patient }) => {
  const [openModal, setOpenModal] = useState(false);

  if (!patient) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 4, backgroundColor: "#f5f5f5", textAlign: "center" }}>
        <Typography variant="h6" color="error">No patient data available</Typography>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString.split('T')[0] || "N/A";
    }
  };


  const statusColors = {
    active: { bg: '#e8f5e9', color: '#2e7d32' },
    inactive: { bg: '#ffebee', color: '#c62828' },
    pending: { bg: '#fff8e1', color: '#f57c00' },
    default: { bg: '#e3f2fd', color: '#1976d2' }
  };

  const getStatusColor = (status) => {
    return statusColors[status?.toLowerCase()] || statusColors.default;
  };

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      overflow: "visible",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
      }
    }}>
      <Box sx={{ p: 3, background: "linear-gradient(145deg, #f5f7fa 0%, #e4e9f2 100%)" }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar 
              src={patient?.image || "/default-avatar.png"} 
              sx={{ 
                width: 90, 
                height: 90, 
                mr: 3, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }} 
            />
            <Box>
              <Typography 
                variant="h5" 
                fontWeight="700" 
                sx={{ mb: 0.5 }}
              >
                {patient?.firstName} {patient?.lastName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={patient?.status || "Unknown"} 
                  size="small"
                  sx={{ 
                    borderRadius: 4, 
                    fontWeight: 600, 
                    textTransform: "capitalize",
                    bgcolor: getStatusColor(patient?.status).bg, 
                    color: getStatusColor(patient?.status).color,
                    px: 1
                  }} 
                />
                
              </Box>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<CalendarMonthIcon />}
              sx={{
                borderRadius: "12px",
                backgroundColor: "#0A192F",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(98, 0, 234, 0.)",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#0A192F",
                  boxShadow: "0 6px 16px rgba(35, 29, 44, 0.3)",
                }
              }}
              onClick={() => setOpenModal(true)}
            >
              Appointment
            </Button>
            <AppointmentModal patientId={patient._id} open={openModal} onClose={() => setOpenModal(false)} />

            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              sx={{
                borderRadius: "12px",
                borderColor: "#0A192F",
                color: "#0A192F",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#0A192F",
                  backgroundColor: "rgba(98, 0, 234, 0.04)",
                }
              }}
            >
              Message
            </Button>
          </Stack>
        </Box>
      </Box>
      
      <Divider />
      
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <CakeIcon color="action" sx={{ mr: 1.5, opacity: 0.7 }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.2 }}>
                  Date of Birth
                </Typography>
                <Typography fontWeight="500">
                  {formatDate(patient.dateOfBirth)}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center">
              <HomeIcon color="action" sx={{ mr: 1.5, opacity: 0.7 }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.2 }}>
                  Address
                </Typography>
                <Typography fontWeight="500">
                  {patient?.address || "No address on file"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <EmailIcon color="action" sx={{ mr: 1.5, opacity: 0.7 }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.2 }}>
                  Email
                </Typography>
                <Typography fontWeight="500">
                  {patient?.email || "No email on file"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center">
              <PhoneIcon color="action" sx={{ mr: 1.5, opacity: 0.7 }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.2 }}>
                  Phone Number
                </Typography>
                <Typography fontWeight="500">
                  {patient?.phone || "No phone on file"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientProfileCard;