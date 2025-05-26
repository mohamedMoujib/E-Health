import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const NAVY_BLUE = '#0A192F';

const CreatePatientModal = ({ open, onClose, editPatient = null, onPatientAdded }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEditMode = !!editPatient;
  const { accessToken } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editPatient) {
      setFormData({
        firstName: editPatient.firstName || '',
        lastName: editPatient.lastName || '',
        email: editPatient.email || '',
        cin: editPatient.cin || '',
        phone: editPatient.phone || '',
        address: editPatient.address || '',
        dateOfBirth: editPatient.dateOfBirth ? editPatient.dateOfBirth.split('T')[0] : ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        cin: '',
        phone: '',
        address: '',
        dateOfBirth: ''
      });
    }
    setErrors({});
  }, [editPatient, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.cin.trim()) {
      newErrors.cin = 'Le CIN est requis';
    } else if (formData.cin.length !== 8) {
      newErrors.cin = 'Le CIN doit contenir 8 caractères';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Le numéro de téléphone doit contenir 8 chiffres';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La date de naissance est requise';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPatientByDoctor = async (patientData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/createPatient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du patient');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const patientData = {
        ...formData,
        // Generate default email if none provided
        email: formData.email || `${formData.cin}@patient.default`
      };

      if (isEditMode) {
        // Handle edit mode if needed
        console.log('Mode édition non implémenté');
      } else {
        await createPatientByDoctor(patientData);
      }
      
      if (onPatientAdded) {
        onPatientAdded();
      }
      
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du patient:', error);
      setErrors({ 
        general: error.message || 'Une erreur est survenue lors de la création du patient' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      cin: '',
      phone: '',
      address: '',
      dateOfBirth: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          px: 3,
          py: 2,
          bgcolor: NAVY_BLUE,
          color: 'white',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {isEditMode ? 'Modifier le patient' : 'Créer un nouveau patient'}
        </Typography>
        <IconButton
          edge="end"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 4, marginTop: 4 }}>
        <form id="patientForm" onSubmit={handleSubmit}>
          {errors.general && (
            <Box sx={{ mb: 2, p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 1 }}>
              <Typography color="error" variant="body2">
                {errors.general}
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                variant="outlined"
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                variant="outlined"
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email (optionnel)"
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                type="email"
                error={!!errors.email}
                helperText={errors.email || "Laissez vide pour générer un email automatique"}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CIN"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 8 }}
                error={!!errors.cin}
                helperText={errors.cin}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                variant="outlined"
                type="tel"
                inputProps={{ maxLength: 8 }}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de naissance"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            {isSubmitting && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isEditMode ? 'Mise à jour...' : 'Création du patient en cours...'}
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: alpha(NAVY_BLUE, 0.1), 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        bgcolor: NAVY_BLUE,
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }} 
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          disabled={isSubmitting}
          sx={{ 
            borderRadius: 2,
            px: 3,
            borderColor: NAVY_BLUE,
            color: NAVY_BLUE,
            '&:hover': {
              backgroundColor: alpha(NAVY_BLUE, 0.05),
              borderColor: NAVY_BLUE
            }
          }}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          form="patientForm"
          disabled={isSubmitting}
          startIcon={isSubmitting ? null : <PersonIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            bgcolor: NAVY_BLUE,
            '&:hover': {
              bgcolor: alpha(NAVY_BLUE, 0.9)
            }
          }}
        >
          {isSubmitting ? 'En cours...' : (isEditMode ? 'Mettre à jour' : 'Créer le patient')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePatientModal;