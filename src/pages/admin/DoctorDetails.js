import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  Email,
  MedicalServices,
  Phone,
  LocationOn,
  Badge,
  CalendarToday
} from '@mui/icons-material';

const DoctorDetails = ({ doctor, open, onClose }) => {
  if (!doctor) return null;

  const formattedDate = doctor.dateOfBirth
    ? new Date(doctor.dateOfBirth).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Non renseignée';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold" align="center">
          Profil du Médecin
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2
          }}
        >
          {/* Avatar amélioré */}
          <Avatar
            src={doctor.image || undefined}
            alt={`${doctor.firstName} ${doctor.lastName}`}
            sx={{
              width: 130,
              height: 130,
              fontSize: 48,
              boxShadow: 3,
              border: '4px solid #1976d2',
              bgcolor: doctor.image ? 'transparent' : 'primary.main'
            }}
          >
            {!doctor.image &&
              `${doctor.firstName?.charAt(0) || ''}${doctor.lastName?.charAt(0) || ''}`
            }
          </Avatar>

          <Typography variant="h6" fontWeight="bold" mt={1}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Typography>

          {/* Carte d'informations */}
          <Paper elevation={2} sx={{ width: '100%', mt: 3, p: 3 }}>
            <Stack spacing={2}>
              <DetailLine icon={<Badge sx={{ color: '#0288d1' }} />} label="ID" value={doctor._id} />
              <DetailLine icon={<MedicalServices sx={{ color: '#7b1fa2' }} />} label="Spécialisation" value={doctor.speciality} />
              <DetailLine icon={<Phone sx={{ color: '#388e3c' }} />} label="Téléphone" value={doctor.phone || 'Non renseigné'} />
              <DetailLine icon={<LocationOn sx={{ color: '#f57c00' }} />} label="Adresse" value={doctor.address || 'Non renseignée'} />
              <DetailLine icon={<Email sx={{ color: '#d32f2f' }} />} label="Email" value={doctor.email} />
              <DetailLine icon={<CalendarToday sx={{ color: '#1976d2' }} />} label="Date de naissance" value={formattedDate} />
            </Stack>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DetailLine = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box sx={{ mr: 2 }}>{React.cloneElement(icon, { fontSize: 'medium' })}</Box>
    <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 140 }}>
      {label} :
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

export default DoctorDetails;
