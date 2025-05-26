import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import ForgotPassword from './components/ForgetPassword';
import AppTheme from '../../components/shared-theme/AppTheme';

import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(2),
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: "url('/background.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(10px)',
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

export default function SignIn(props) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user role from Redux state if available
  const role = useSelector(state => state.auth?.role);
  
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState({ email: '', password: '', auth: '' });
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear auth error when user starts typing
    if (errors.auth) {
      setErrors((prev) => ({ ...prev, auth: '' }));
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCloseError = () => {
    setErrors(prev => ({ ...prev, auth: '' }));
  };

  const getErrorSeverity = (errorMessage) => {
    if (errorMessage.includes('pending') || errorMessage.includes('validation') || errorMessage.includes('approval')) {
      return 'warning';
    }
    return 'error';
  };

  const getErrorTitle = (errorMessage) => {
    if (errorMessage.includes('pending') || errorMessage.includes('validation') || errorMessage.includes('approval')) {
      return 'Compte en attente de validation';
    }
    return 'Erreur de connexion';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setErrors(prev => ({ ...prev, auth: '' }));

    try {
      console.log("Submitting login form with:", { email: formData.email });
      const result = await login(formData);
      console.log("Login successful:", result);
      
      // Check if user is admin and redirect accordingly
      // This assumes your login function returns user data or updates Redux store
      const userRole = result?.role || role;
      
      if (userRole === 'admin') {
        console.log("Admin user detected, redirecting to admin dashboard");
        navigate("/admin");
      } else {
        console.log("Regular user detected, redirecting to user dashboard");
        navigate("/dashboard/Acceuil");
      }
    } catch (error) {
      console.error("Login error caught in component:", error);
      
      // Extract the string message from the error
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error?.message || "Authentication failed");
      
      console.log("Setting error in state:", errorMessage);
      setErrors((prev) => ({ ...prev, auth: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <LogoContainer>
            <img src="/logo2.png" alt="Logo" width="100" height="100" style={{ marginTop: '20px', marginBottom: '10px' }} />
          </LogoContainer>
          
          {/* Error Alert - Now inside the card */}
          {errors.auth && (
            <Alert 
              severity={getErrorSeverity(errors.auth)}
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseError}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <AlertTitle>{getErrorTitle(errors.auth)}</AlertTitle>
              {errors.auth}
              {errors.auth.includes('pending') && (
                <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                  💡 Vérifiez régulièrement votre email pour les notifications d'approbation
                </Typography>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={!!errors.email}
                helperText={errors.email}
                id="email"
                type="email"
                name="email"
                required
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <TextField
                error={!!errors.password}
                helperText={errors.password}
                name="password"
                type="password"
                id="password"
                required
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <Link component="button" onClick={handleClickOpen} variant="body2">Mot de passe oublié ?</Link>
          </Box>
          <Divider>ou</Divider>
          <Typography sx={{ textAlign: 'center' }}>Vous n'avez pas de compte ? <Link href="/signup" variant="body2">S'inscrire</Link></Typography>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}