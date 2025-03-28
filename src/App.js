import React, { useState } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/sign-in/sign-in";
import SignUp from "./pages/sign-up/SignUp";
import ResetPassword from "./pages/sign-in/components/ResetPassword";
import Dashboard from "./pages/dashboard"; // Import the Dashboard component
import ProtectedRoute from "./routes/ProtectedRoute"; 

// Dashboard Pages
import Acceuil from "./pages/Acceuil"; // Ensure correct path
import Patients from "./pages/Patients"; // Ensure correct path
import RendezVous from "./pages/RendezVous"; // Ensure correct path
import Articles from "./pages/Articles"; // Ensure correct path
import Agenda from "./pages/Agenda"; // Ensure correct path
import Chats from "./pages/Chats"; // Ensure correct path
import Profile from "./pages/Profile"; 
import PatientPage from "./pages/PatientPage";
import AppointmentManagement from "./pages/AppointmentManagement";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // State for sidebar toggle

  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<SignIn />} />

        {/* Dashboard Routes */}
        <Route element={ <ProtectedRoute /> } >
          <Route
            path="/dashboard/*"
            element={<Dashboard open={sidebarOpen} setOpen={setSidebarOpen} />} >
            {/* Nested routes for dashboard */}
            <Route index element={<Acceuil />} /> {/* Default route for /dashboard */}
            <Route path="Acceuil" element={<Acceuil />} />
            <Route path="Patients/*" element={<Patients />} />
            <Route path="Patients/:patientId" element={<PatientPage/>}/>
            <Route path="Patients/:patientId/appointments" element={<AppointmentManagement/>}/>
            <Route path="Rendez-vous" element={<RendezVous />} />
            <Route path="Articles" element={<Articles />} />
            <Route path="Agenda" element={<Agenda />} />
            <Route path="Chats" element={<Chats />} />
            <Route path="Profile" element={<Profile />} />
             


          </Route>
        </Route>
        {/* Fallback Route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;