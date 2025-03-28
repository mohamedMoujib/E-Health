import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; 
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom"; // Import React Router
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Notifications,
} from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home"; // Acceuil
import PeopleIcon from "@mui/icons-material/People"; // Patients
import EventIcon from "@mui/icons-material/Event"; // Rendez-vous
import ArticleIcon from "@mui/icons-material/Article"; // Articles
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // Agenda
import ChatIcon from "@mui/icons-material/Chat"; // Chats
import { useSelector } from "react-redux";
import { fetchUserProfile } from "../../Redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
const Sidebar = ({open, setOpen}) => {
    const userProfile = useSelector((state) => state.user.profile);
    const dispatch = useDispatch();

  const { logout } = useAuth(); // Get logout function from AuthContext
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleSidebar = () => {
    if (setOpen) setOpen(!open);
  };  
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
  useEffect(() => {
    dispatch(fetchUserProfile());
    console.log("Fetching user profile...");
    console.log("User Profile:", userProfile);

  }, [dispatch]);
  console.log("User Profile:", userProfile);

  // Dropdown menu logic
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Set anchorEl to the clicked element
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Reset anchorEl when closing the menu
  };

  // Get the current location to highlight the active route
  const location = useLocation();
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 260 : 80,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? 260 : 80,
            transition: "width 0.3s ease-in-out",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRight: "none",
            backgroundColor: "#f5f5f5", // Neutral light gray background
            color: "#78B3CE", // Default icon/text color
          },
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {/* Toggle Sidebar Button */}
          <ListItem
            button
            onClick={toggleSidebar}
            sx={{
              justifyContent: open ? "flex-end" : "center", // Move to right when open, center when closed
              padding: "12px",
              paddingLeft: open ? "0" : "45px",
              
            }}
          >
            <ListItemIcon>
              <MenuIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
          </ListItem>

          {/* Navigation Items */}
          <ListItem
            component={Link}
            to="/dashboard/Acceuil"
            selected={location.pathname === "/dashboard/Acceuil"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Acceuil" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <HomeIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Acceuil"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          <ListItem
            component={Link}
            to="/dashboard/Patients"
            selected={location.pathname === "/dashboard/Patients"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Patients" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <PeopleIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Patients"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          <ListItem
            component={Link}
            to="/dashboard/Rendez-vous"
            selected={location.pathname === "/dashboard/Rendez-vous"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Rendez-vous" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <EventIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Rendez-vous"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          <ListItem
            component={Link}
            to="/dashboard/Articles"
            selected={location.pathname === "/dashboard/Articles"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Articles" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <ArticleIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Articles"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          <ListItem
            component={Link}
            to="/dashboard/Agenda"
            selected={location.pathname === "/dashboard/Agenda"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Agenda" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <CalendarTodayIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Agenda"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          <ListItem
            component={Link}
            to="/dashboard/Chats"
            selected={location.pathname === "/dashboard/Chats"} // Highlight active route
            button
            sx={{
              px: 3.5,
              color: "#78B3CE", // Default text color
              "&:hover": {
                backgroundColor: "#78B3CE", // Hover background color
                color: "#fff", // Hover text/icon color
              },
              ...(location.pathname === "/dashboard/Chats" && {
                backgroundColor: "#78B3CE", // Selected background color
                color: "#fff", // Selected text/icon color
              }),
            }}
          >
            <ListItemIcon>
              <ChatIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Chats"
                sx={{ color: "inherit" }} // Inherit color from parent ListItem
              />
            )}
          </ListItem>

          {/* Optional: Add more items here if needed */}
        </List>

        {/* Divider */}
        <Divider sx={{ my: 1, opacity: 0.2 }} />

        {/* Footer */}
        <Typography variant="caption" align="center" sx={{ mt: "auto", p: 1, opacity: 0.7 }}>
          © 2025 Haouech rights reserved
        </Typography>
      </Drawer>

      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? 260 : 80}px)`,
          ml: `${open ? 260 : 80}px`,
          background: "#78B3CE", // Teal navbar background
          color: "#fff", // White text/icons
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Display the current route name in the AppBar */}
          <Typography variant="h6" noWrap component="div" sx={{ color: "#fff" }}>
            {location.pathname.split("/")[2] || "Dashboard"} {/* Dynamically update the title */}
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit" onClick={handleMenuOpen} sx={{ mr: 1 }}>
  <img 
    src={userProfile.image || "/default-avatar.png"} 
    alt="User Avatar"
    style={{ width: 50, height: 50, borderRadius: "50%" }} 
  />
</IconButton>


            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ style: { backgroundColor: "#78B3CE", color: "#fff" } }}
            >
              <MenuItem component={Link} to="/dashboard/Profile">Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            <IconButton color="inherit">
              <Notifications sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: open ? 260 : 80,
          pt: 6,
          pl: open ? 3 : 1,
          pr: 3,
          pb: 3,
        }}
      ></Box>
    </Box>
  );
};

export default Sidebar;