import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../components/shared-theme/AppTheme';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext
import { useNavigate } from 'react-router-dom'; // For redirection

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "105vh",
  minHeight: "100%",
  padding: theme.spacing(2),
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: "blur(10px)",
    zIndex: -1,
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  textAlign: 'center',
}));

// List of medical specialties
const SPECIALITIES = [
  "Cardiologue", "Dentiste", "Dermatologue", "Generaliste", "Gynecologue",
  "Neurologue", "Ophtalmologiste", "Orthopedique", "Pediatre", "Psychiatre",
  "Radiologue", "Urologue", "Sexologue", "Orl", "Gastro", "Rhumatologue",
  "Nephrologie", "Pneumologue", "Nutritionniste"
];

export default function SignUp(props) {
  const { signup } = useAuth(); // Récupérer la fonction signup depuis AuthContext
  const navigate = useNavigate(); // Hook pour rediriger après l'inscription

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
    address: '',
    speciality: '',
    dateOfBirth: '', // Changed from dob to dateOfBirth
    password: ''
  });

  const [errors, setErrors] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    cin: '',
    address: '',
    speciality: '',
    dateOfBirth: '' // Changed from dob to dateOfBirth
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide.';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis.';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis.';
    }

    if (!formData.phone || !/^\+?\d{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide.';
    }

    if (!formData.cin || !/^\d{8}$/.test(formData.cin)) {
      newErrors.cin = 'CIN invalide (8 chiffres requis).';
    }

    if (!formData.address) {
      newErrors.address = 'L\'adresse est requise.';
    }

    if (!formData.speciality) {
      newErrors.speciality = 'La spécialité est requise.';
    }

    if (!formData.dateOfBirth) { 
      newErrors.dateOfBirth = 'La date de naissance est requise.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }

    const payload = {
      ...formData,
      role: 'doctor'
    };
    try {
      await signup(payload); // Use signup from AuthContext
      navigate('/signin'); // Redirect after successful signup
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        userExists: error || 'Une erreur est survenue lors de l\'inscription.'
      }));
    }
  };
   return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column">
      {errors.userExists && (
              <Typography 
                color="error" 
                sx={{ 
                  position: 'absolute', 
                  top: '110px',  // Position the error message above the form
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  textAlign: 'center', 
                  width: '100%', 
                  zIndex: 10 
                }}
              >
              {errors.userExists}
            </Typography>
  )}
        <Card variant="outlined">
           
          <LogoContainer>
            <img src="/logo2.png" alt="Logo" width="90" height="90" style={{ marginTop: '-15px', marginBottom: '10px' }} />
          </LogoContainer>
           
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <FormLabel>Prénom</FormLabel>
                    <Tooltip title={errors.firstName || ""} open={!!errors.firstName} arrow>
                      <TextField
                        required
                        fullWidth
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName} // Red border if error exists
                        placeholder="John"
                      />
                    </Tooltip>
                  </FormControl>
                </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Nom</FormLabel>
                  <Tooltip title={errors.lastName || ""} open={!!errors.lastName} arrow>
                  <TextField
                    required
                    fullWidth
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    placeholder="Doe"
                  />
                  </Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Email</FormLabel>
                  <Tooltip title={errors.email || ""} open={!!errors.email} arrow>
                  <TextField
                    required
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    placeholder="exemple@email.com"
                  />
                  </Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Téléphone</FormLabel>
                  <Tooltip title={errors.phone || ""} open={!!errors.phone} arrow>
                  <TextField
                    required
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    placeholder="+216 99 999 999"
                  />
                  </Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>CIN</FormLabel>
                  <Tooltip title={errors.cin || ""} open={!!errors.cin} arrow>
                  <TextField
                    required
                    fullWidth
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    error={!!errors.cin}
                    placeholder="12345678"
                  /></Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Adresse</FormLabel>
                  <Tooltip title={errors.address || ""} open={!!errors.address} arrow>
                  <TextField
                    required
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    placeholder="Ville, Pays"
                  />
                  </Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Spécialité</FormLabel>
                  <Tooltip title={errors.speciality || ""} open={!!errors.speciality} arrow>
                    <Select
                      required
                      fullWidth
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      error={!!errors.speciality}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Sélectionnez 
                      </MenuItem>
                      {SPECIALITIES.map((specialty) => (
                        <MenuItem key={specialty} value={specialty}>
                          {specialty}
                        </MenuItem>
                      ))}
                    </Select>
                  </Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Date de naissance</FormLabel>
                  <Tooltip title={errors.dateOfBirth || ""} open={!!errors.dateOfBirth} arrow>
                  <TextField
                    required
                    fullWidth
                    name="dateOfBirth" // Changed from dob to dateOfBirth
                    type="date"
                    value={formData.dateOfBirth} // Changed from dob to dateOfBirth
                    onChange={handleChange}
                    error={!!errors.dateOfBirth} // Changed from dob to dateOfBirth
                  /></Tooltip>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Mot de passe</FormLabel>
                  <Tooltip title={errors.password || ""} open={!!errors.password} arrow>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    placeholder="••••••"
                  /></Tooltip>
                </FormControl>
              </Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained">
              S'inscrire
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center' }}>
          <Divider>ou</Divider>
            Déjà un compte ? <Link href="/signin" variant="body2">Se connecter</Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}