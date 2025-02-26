import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../../components/shared-theme/AppTheme';
import {useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

const ResetPasswordContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  minHeight: "100%",
  padding: theme.spacing(2),
  position: "relative", // Ensures layering works correctly
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },

  // Background Image Container
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/background.jpg')", // Set your image path
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: "blur(10px)", // Apply the blur effect only to the background
    zIndex: -1, // Ensures it stays behind the form
  },
}));

export default function ResetPassword(props) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');

  const validateInputs = () => {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    let isValid = true;

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (password.value !== confirmPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Les mots de passe ne correspondent pas.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
      event.preventDefault();
    if (!validateInputs()) return; 

    const data = new FormData(event.currentTarget);
    const newPassword = data.get('password');
    const confirmPassword = data.get('confirmPassword');

    try {
      const response = await fetch( `${process.env.REACT_APP_API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  

        },
        credentials: 'include', // ✅ Add this
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Password reset failed.');
    }

    alert("Mot de passe réinitialisé avec succès !");
    navigate("/signin");
  }
  catch (error) {
    alert(error.message);
  }};
  

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ResetPasswordContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }} // Change the color of the title
          >
            Réinitialiser le mot de passe
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="password">Nouveau mot de passe</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirmer le mot de passe</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirmPassword"
                placeholder="••••••"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? 'error' : 'primary'}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Réinitialiser le mot de passe
            </Button>
            <Link
              href="/signin"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Retour à la connexion
            </Link>
          </Box>
          <Divider>ou</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Vous n'avez pas de compte ?{' '}
              <Link
                href="/signup"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Card>
      </ResetPasswordContainer>
    </AppTheme>
  );
}