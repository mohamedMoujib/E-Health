import React, { useEffect, useState } from "react"; 
import { 
  Card, 
  Typography,
  Box,
  List,
  ListItem,
  Divider,
  Button,
  Pagination
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { fetchAppointmentsByPatient } from "../../Redux/slices/appointmentSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AppointmentHistoryCard = ({ patientId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (patientId) {
      dispatch(fetchAppointmentsByPatient(patientId));
    }
  }, [dispatch, patientId]);

  // Filter out canceled appointments
  const filteredAppointments = appointments.filter(appointment => appointment.status !== "canceled");
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleAppointmentClick = (appointment) => {
    if (['pending', 'confirmed'].includes(appointment.status)) {
      navigate(`/dashboard/Patients/${patientId}/appointments`, { state: { appointment } });
    }
  };

  const getStatusColor = (status) => {
    if (status === "completed") return "#5D9CEC";  // Blue for completed
    if (status === "pending") return "#FFFBE6"; // Light yellow for pending
    if (status === "confirmed") return "#E9F7EF"; // Light green for confirmed
    return "#F0F0F0";  // Default for other statuses
  };

  return (
    <Card sx={{ 
      borderRadius: "16px", 
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
      }
    }}>
      <Box sx={{ background: "linear-gradient(145deg, #f5f7fa 0%, #e4e9f2 100%)", px: 3, py: 2 }}>
        <Typography variant="h6" fontWeight="600" color="#333">
          Historique des rendez-vous
        </Typography>
      </Box>
      
      <Divider />

      <Box sx={{ position: "relative" }}>
        <Box 
          sx={{ 
            position: "absolute", 
            left: "136px", 
            top: "24px", 
            bottom: "48px", 
            width: "2px", 
            bgcolor: "#E0E0E0", 
            zIndex: 0 
          }} 
        />

        <List sx={{ py: 0, px: 0 }}>
          {paginatedAppointments.map((appointment, index) => (
            <ListItem 
              key={index} 
              button 
              onClick={() => handleAppointmentClick(appointment)}
              sx={{ 
                px: 3, 
                py: 1.5,
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2,
                opacity: appointment.status === "canceled" ? 0.6 : 1,
                '&:hover': {
                  bgcolor: ['pending', 'confirmed'].includes(appointment.status) ? 'action.hover' : 'inherit'
                },
                cursor: ['pending', 'confirmed'].includes(appointment.status) ? 'pointer' : 'default',
              }}
            >
              <Box sx={{ minWidth: "90px", pt: 0.5 }}>
                <Typography variant="body2" fontWeight="500" color="#555">
                  {appointment.date.split('T')[0]}
                </Typography>
                <Typography variant="body2" color="#777">
                  {appointment.time}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1, position: "relative", zIndex: 1 }}>
                <FiberManualRecordIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: appointment.status === "pending" ? "#D4B829" : 
                    appointment.status === "confirmed" ? "#4CAF50" : "#0A192F",
                  }} 
                />
              </Box>
              
              <Box 
                sx={{ 
                  flex: 1, 
                  bgcolor: getStatusColor(appointment.status), 
                  borderRadius: "8px", 
                  p: 1.5,
                  pl: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight="500" 
                  sx={{ pr: 1 }}
                >
                  {appointment.type}
                </Typography>
                {appointment.status === "pending" ? (
                  <AccessTimeIcon sx={{ color: "#D4B829", fontSize: 20 }} />
                ) : appointment.status === "confirmed" ? (
                  <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                ) : (
                  <CheckCircleIcon sx={{ color: "#0A192F", fontSize: 20 }} />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ marginTop: "2px", display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={(event, page) => setCurrentPage(page)}
          />
        </Box>
      )}
    </Card>
  );
};

export default AppointmentHistoryCard;
