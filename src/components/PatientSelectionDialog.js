import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';

// Import the action
import { fetchPatientsList } from '../Redux/slices/patientsSlice';

const PatientSelectionDialog = ({ open, onClose, onSelectPatient }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  
  const patientsState = useSelector((state) => state.patients);

  const patientsList = Array.isArray(patientsState?.list) ? patientsState.list : [];
  const patientsStatus = patientsState?.status || 'idle';
  const patientsError = patientsState?.error || null;

  useEffect(() => {
    if (open) {
      dispatch(fetchPatientsList());
    }
  }, [open, dispatch]);

  // Only filter if we have a real array to work with
  const filteredPatients = patientsList.filter(patient => {
    if (!patient) return false;
    const searchLower = searchQuery.toLowerCase();
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    return (
      firstName.toLowerCase().includes(searchLower) ||
      lastName.toLowerCase().includes(searchLower) ||
      `${firstName} ${lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectPatient = (patient) => {
    if (!patient?._id) {
      console.error("Invalid patient selected");
      return;
    }
    onSelectPatient(patient);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select a Patient</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          placeholder="Search patients..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        {patientsStatus === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : patientsError ? (
          <Typography color="error" sx={{ p: 2 }}>
            {patientsError || 'Error loading patients'}
          </Typography>
        ) : filteredPatients.length === 0 ? (
          <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
            {patientsList.length === 0 ? 'No patients available' : 'No matching patients found'}
          </Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {filteredPatients.map((patient) => (
              <ListItem 
                button 
                onClick={() => handleSelectPatient(patient)} 
                key={patient._id || Math.random()}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(10, 25, 47, 0.05)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={patient.image}
                    sx={{ 
                      bgcolor: '#0A192F',
                      fontSize: '1.2rem'
                    }}
                  >
                    {`${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {`${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {patient.email || patient.phone || 'No contact info'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientSelectionDialog;