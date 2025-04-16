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
import { fetchPatientsList } from '../Redux/slices/patientsSlice';
import { fetchChats } from '../Redux/slices/chatSlice';

const PatientSelectionDialog = ({ open, onClose, onSelectPatient }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get patients data
  const patientsState = useSelector((state) => state.patients);
  const patientsList = Array.isArray(patientsState?.list) ? patientsState.list : [];
  const patientsLoading = patientsState?.status === 'loading';
  const patientsError = patientsState?.error || null;
  
  // Get chats data
  const chatsState = useSelector((state) => state.chat);
  const chatsList = Array.isArray(chatsState?.chats) ? chatsState.chats : [];
  const chatsLoading = chatsState?.loading?.chats || false;
  const chatsError = chatsState?.error?.chats || null;

  useEffect(() => {
    if (open) {
      dispatch(fetchPatientsList());
      dispatch(fetchChats());
    }
  }, [open, dispatch]);

  // Filter out patients you already have chats with
  const getPatientsWithoutChats = () => {
    const patientIdsWithChats = chatsList.map(chat => chat.patient?._id);
    return patientsList.filter(patient => 
      patient && !patientIdsWithChats.includes(patient._id)
    );
  };

  const patientsWithoutChats = getPatientsWithoutChats();

  // Apply search filter
  const filteredPatients = patientsWithoutChats.filter(patient => {
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
    dispatch(fetchChats()); // 
    onClose();
  };

  // Combined loading state
  const isLoading = patientsLoading || chatsLoading;
  const error = patientsError || chatsError;

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
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error || 'Error loading data'}
          </Typography>
        ) : filteredPatients.length === 0 ? (
          <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
            {patientsWithoutChats.length === 0 ? 'No patients available without existing chats' : 'No matching patients found'}
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