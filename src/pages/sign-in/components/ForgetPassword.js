import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import Alert from "@mui/material/Alert";
import { useState } from 'react';


function ForgotPassword({ open, handleClose }) {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/forget-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Add this
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Une erreur s'est produite.");
      } else {
        setSuccess("Lien de réinitialisation du mot de passe envoyé avec succès.");
        setTimeout(() => {
          setSuccess("");
          handleClose(); // Fermer la modal après le succès
        }, 3000);
      }
    } catch (error) {
      setError("Échec de l'envoi du lien de réinitialisation du mot de passe.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            handleClose();
          },
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Entrez l'adresse e-mail de votre compte et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          label="Adresse e-mail"
          placeholder="Adresse e-mail"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)} 

        />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Annuler</Button>
        <Button variant="contained" type="submit" onClick={handleSubmit}>
          Continuer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;