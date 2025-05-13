import React from "react";
import { Grid, Paper, Typography, Box, Card, CardContent } from "@mui/material";
import { 
  PersonAdd as PersonAddIcon,
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";

const AdminHome = () => {
  // Sample stats - in a real app, these would come from your API/state
  const stats = [
    { title: "Total Doctors", value: 24, icon: <PeopleIcon sx={{ fontSize: 40, color: "#3498db" }} /> },
    { title: "Active Patients", value: 456, icon: <PersonAddIcon sx={{ fontSize: 40, color: "#2ecc71" }} /> },
    { title: "Appointments Today", value: 12, icon: <EventNoteIcon sx={{ fontSize: 40, color: "#e74c3c" }} /> },
    { title: "Total Users", value: 532, icon: <BarChartIcon sx={{ fontSize: 40, color: "#9b59b6" }} /> }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 2,
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  {stat.title}
                </Typography>
                {stat.icon}
              </Box>
              <Typography variant="h3" component="div">
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">Dr. Smith was added to the system</Typography>
              <Typography variant="caption" color="textSecondary">Today, 10:23 AM</Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">Patient records were updated for Jane Doe</Typography>
              <Typography variant="caption" color="textSecondary">Yesterday, 4:12 PM</Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2">3 new appointments were scheduled</Typography>
              <Typography variant="caption" color="textSecondary">Yesterday, 2:45 PM</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database</Typography>
                  <Typography variant="body2" color="success.main">Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Server</Typography>
                  <Typography variant="body2" color="success.main">Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Message Queue</Typography>
                  <Typography variant="body2" color="success.main">Online</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="body2" color="success.main">
                  All systems operational
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminHome;