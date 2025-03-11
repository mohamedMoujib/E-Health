// ProfilePage.js
import React, { useState } from "react";
import { Box,Tab, Tabs } from "@mui/material";
import PersonalDetails from "../components/shared-theme/PersonalDetails";
import Availability from "../components/shared-theme/Availability";
import AccountDetails from "../components/shared-theme/AccountDetails";

import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
const Profile = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '500px' }}>

        <Tabs 
  value={value} 
  onChange={handleChange} 
  aria-label="profile tabs"
  
>
  <Tab 
    icon={<PersonIcon />} 
    label="Profil" 
    sx={{ 
      color: value === 0 ? '#78B3CE' : 'inherit',
      fontWeight: value === 0 ? 'bold' : 'normal'
    }} 
  />
  
  <Tab 
    icon={<CalendarTodayIcon />} 
    label="Disponibilité" 
    sx={{ 
      color: value === 1 ? '#78B3CE' : 'inherit',
      fontWeight: value === 1 ? 'bold' : 'normal'
    }} 
  />
  <Tab 
    icon={<BadgeIcon />} 
    label="Compte" 
    sx={{ 
      color: value === 2 ? '#78B3CE' : 'inherit',
      fontWeight: value === 2 ? 'bold' : 'normal'
    }} 
  />
</Tabs>

        {/* <Box sx={{ width: '100%', mx: 'auto', p: 5, minHeight: '400px' }}> */}
                {value === 0 && <PersonalDetails />}
                {value === 1 && <Availability />}
                {value === 2 && <AccountDetails />}
{/* </Box> */}
</Box>


    </div>
  );
};

export default Profile;