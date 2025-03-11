import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import CardOverflow from '@mui/joy/CardOverflow';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import { useSelector } from 'react-redux';
import { fetchUserProfile , updateUserProfile,updateProfileImage} from '../../Redux/slices/userSlice'; // Adjust path
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';


export default function PersonalDetails() {

    // Fetch user profile data from Redux store
  const userProfile = useSelector((state) => state.user.profile);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = React.useState(null);

// Initialize formData with existing user profile
const [formData, setFormData] = React.useState({
  firstName: userProfile?.firstName || '',
  lastName: userProfile?.lastName || '',
  speciality: userProfile?.speciality || '',
  email: userProfile?.email || '',
  phone: userProfile?.phone || '',
  cin: userProfile?.cin || '',
  dateOfBirth: userProfile?.dateOfBirth 
    ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] 
    : '',
  address: userProfile?.address || ''
});

// Handle file selection
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  setProfileImage(file);
};

useEffect(() => {
  dispatch(fetchUserProfile());
}, [dispatch]);

// Update form data when user profile changes
useEffect(() => {
  if (userProfile) {
    setFormData({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      speciality: userProfile.speciality || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      cin: userProfile.cin || '',
      dateOfBirth: userProfile.dateOfBirth 
        ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] 
        : '',
      address: userProfile.address || ''
    });
  }
}, [userProfile]);

// Handle input changes
const handleChange = (event) => {
  const { name, value } = event.target;
  setFormData(prevData => ({
    ...prevData,
    [name]: value
  }));
};

// Submit form
const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    // Step 1: Create FormData object and append text fields
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    // Step 1: Update text fields
    await dispatch(updateUserProfile(formData))
      .unwrap()
      .then((response) => {
        console.log("Text fields updated successfully:", response);
      });

    // Step 2: Upload the image (if a new image is selected)
    if (profileImage) {
      const formDataToSend = new FormData();
      formDataToSend.append("image", profileImage);

      await dispatch(updateProfileImage(formDataToSend))
      .unwrap()
      .then((response) => {
        console.log("Image uploaded successfully:", response);
      });
    }

    // Optionally, refetch the user profile to reflect changes
    dispatch(fetchUserProfile());
    alert("Profil mis à jour avec succès !");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    alert("Une erreur est survenue lors de la mise à jour.");
  }
};
if (loading) return <p>Loading...</p>;
if (error) return <p>{error.message || "An error occurred"}</p>;

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: { sm: -100, md: -110 },
          bgcolor: 'background.body',
          zIndex: 9995,
        }}
      >
        
      </Box>
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
            <Typography level="title-md">Informations personnelles</Typography>
            
          </Box>
          <Divider />
          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: 'none', md: 'flex' }, my: 1 }}
          >
            <Stack direction="column" spacing={1}>
              <AspectRatio
                ratio="1"
                maxHeight={200}
                sx={{
                  flex: 1,
                  minWidth: 120,
                  borderRadius: '100%',
                  
                }}
              >
                {/* Dynamically display the uploaded image */}
                <img src={profileImage ? URL.createObjectURL(profileImage) : userProfile?.image || "/User.jpg"} />
              </AspectRatio>
              {/* File input for uploading a new image */}
              <input
                type="file"
                accept="image/*"
                name="image"
                style={{ display: 'none' }} // Hide the file input
                id="upload-profile-picture"
                onChange={handleFileUpload} // Handle file selection
              />
              {/* Label for the file input */}
              <label htmlFor="upload-profile-picture">
                <IconButton
                  aria-label="upload new picture"
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  component="span" // Make the IconButton act as the label
                  sx={{
                    bgcolor: 'background.body',
                    position: 'absolute',
                    zIndex: 2,
                    borderRadius: '50%',
                    left: 100,
                    top: 170,
                    boxShadow: 'sm',
                  }}
                >
                  <EditRoundedIcon />
                </IconButton>
              </label>
            </Stack>
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              <Stack spacing={1}>
                <FormLabel>Nom</FormLabel>
                <FormControl
                  sx={{ display: { sm: 'flex-column', md: 'flex-row' }, gap: 2 }}
                >
                  <Input name="firstName" size="sm" placeholder={userProfile?.firstName || ''} defaultValue={userProfile?.firstName || ''}  onChange={handleChange}/>
                  <Input name="lastName" size="sm" placeholder="Nom de famille"  defaultValue={userProfile?.lastName || ''} sx={{ flexGrow: 1 }} onChange={handleChange}/>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Spécialité</FormLabel>
                  <Input
                  name='speciality'
                    size="sm"
                    startDecorator={<WorkRoundedIcon />}
                    placeholder="Spécialité"
                    defaultValue={userProfile?.speciality || ''} 
                    onChange={handleChange}                 />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    size="sm"
                    name='email'
                    type="email"
                    startDecorator={<EmailRoundedIcon />}
                    placeholder="Email"
                    defaultValue={userProfile?.email || ''}
                    sx={{ flexGrow: 1 }}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    name='phone'
                    size="sm"
                    type="tel"
                    startDecorator={<PhoneRoundedIcon />}
                    placeholder="Téléphone"
                    defaultValue={userProfile?.phone || ''}
                    sx={{ flexGrow: 1 }}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>CIN</FormLabel>
                  <Input
                    size="sm"
                    name='cin'
                    startDecorator={<CardMembershipRoundedIcon />}
                    placeholder="CIN"
                    defaultValue={userProfile?.cin || ''}
                    sx={{ flexGrow: 1 }}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Date de naissance</FormLabel>
                  <Input
                  name='dateOfBirth'
                    size="sm"
                    type="date"
                    startDecorator={<CalendarTodayRoundedIcon />}
                    defaultValue={userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] : ''} 
                    sx={{ flexGrow: 1 }}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Adresse</FormLabel>
                  <Input
                    size="sm"
                    name='address'
                    startDecorator={<LocationOnRoundedIcon />}
                    placeholder={userProfile?.address || ''}
                    defaultValue={userProfile?.address || ''}
                    sx={{ flexGrow: 1 }}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
            </Stack>
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