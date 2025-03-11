import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import CardOverflow from '@mui/joy/CardOverflow';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile , fetchUserProfile } from '../../Redux/slices/userSlice';
import { useEffect } from 'react';
export default function AccountDetails() {
  const dispatch =useDispatch();
  const token = useSelector((state) => state.auth.accessToken); // Assuming you have accessToken in auth slice
  const loading = useSelector((state) => state.user.loading);

  useEffect(() => {
      dispatch(fetchUserProfile());
  
    }, [dispatch]);

    const [formData ,setFormData ] = React.useState({
      password : "" ,
      confirmedPassword : ""
    })

    const handleChange = (event) => {
      const {name,value}=event.target ;
      setFormData(prevData => ({
        ...prevData,
        [name]:value
      }) );
    }
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (formData.password !== formData.confirmedPassword) {
        alert("Passwords do not match");
        return;
      }
      try {
       
        const response = await fetch( `${process.env.REACT_APP_API_URL}/auth/reset-password/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  
  
          },
          credentials: 'include', // ✅ Add this
          body: JSON.stringify({newPassword: formData.password, confirmPassword:formData.confirmedPassword }),
        });
        if (!response.ok) {
          throw new Error('Failed to update password');
        }
        alert("Password updated successfully");
        setFormData({
          password: "",
          confirmedPassword: ""
        });
      }catch (error) {
        console.error("Failed to update password:", error);
        alert("Failed to update password");
        setFormData({
          password: "",
          confirmedPassword: ""
        });
      }
    };
  return (
    <Box sx={{ flex: 2, width: '200%' }}>
      <Stack
        spacing={4}
        sx={{
          display: 'flex',
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Changer mot de passe</Typography>
          </Box>
          <Divider />
          <Stack spacing={3} sx={{ my: 2, mx:20 }}>
            <FormControl sx={{ flexGrow: 1 }}>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <Input
                size="sm"
                name='password'
                type="password"
                startDecorator={<LockRoundedIcon />}
                placeholder="Entrer nouveau mot de passe"
                sx={{ flexGrow: 1 }}
                value={formData.password} // Add value attribute
                onChange={handleChange}

              />
            </FormControl>
            <FormControl sx={{ flexGrow: 1 }}>
              <FormLabel>Confirmer Nouveau mot de passe</FormLabel>
              <Input
                size="sm"
                type="password"
                name='confirmedPassword'
                startDecorator={<LockRoundedIcon />}
                placeholder="Confirmer nouveau mot de passe"
                sx={{ flexGrow: 1 }}
                value={formData.confirmedPassword} 
                onChange={handleChange}

              />
            </FormControl>
          </Stack>
          <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
              <Button size="sm" variant="outlined" color="neutral">
                Annuler
              </Button>
              <Button size="sm" variant="solid" onClick={handleSubmit}>
                Sauvegarder
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </Box>
  );
}
