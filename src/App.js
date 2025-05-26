// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./styles/App.css";

// Auth Pages
import SignIn from "./pages/sign-in/sign-in";
import SignUp from "./pages/sign-up/SignUp";
import ResetPassword from "./pages/sign-in/components/ResetPassword";

// Protected Dashboard
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

// Dashboard Pages
import Acceuil from "./pages/Acceuil";
import Patients from "./pages/Patients";
import RendezVous from "./pages/RendezVous";
import Articles from "./pages/Articles";
import Agenda from "./pages/Agenda";
import Chats from "./pages/Chats";
import Profile from "./pages/Profile";
import PatientPage from "./pages/PatientPage";
import AppointmentManagement from "./pages/AppointmentManagement";



// Admin Pages
import AdminHome from "./pages/admin/AdminHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorsList from "./pages/admin/DoctorsList";
import DoctorDetails from "./pages/admin/DoctorDetails";
// Firebase messaging
import {
  setupMessageHandler,
  registerServiceWorker,
  requestNotificationPermission,
  setupTokenRefresh
} from './firebase-messaging';

// Socket Service
import {
  initializeSocket,
  registerSocketHandlers,
  disconnectSocket,
  joinChatRoom,
  leaveChatRoom
} from './services/socketService';

// Redux Actions
import { newMessageReceived } from './Redux/slices/chatSlice';
import { addNotification } from './Redux/slices/notificationSlice';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [chatId, setChatId] = useState(null); // Optional: update from chat context or props

  useEffect(() => {
    // dispatch(loadSavedNotifications());
  
    if (user?._id) {
      // Import isLoggedOut synchronously to check state
      const { isLoggedOut } = require('./services/socketService');
      
      if (isLoggedOut()) {
        console.log("User is logged out, not connecting socket");
        return;
      }
      
      const socket = initializeSocket(user);
  
      // Handlers for specific socket events
      const handleNewMessage = (message) => {
        console.log("New message received via socket:", message);
        dispatch(newMessageReceived(message));
      };
  
      const handleNewNotification = (notification) => {
        console.log("New notification received via socket:", notification);
        
        // Add to Redux store
        const newNotification = {
          _id: notification.notificationId || Date.now().toString(),
          notificationId: notification.notificationId || Date.now().toString(),
          title: notification.title || 'New Notification',
          content: notification.content,
          createdAt: notification.createdAt || Date.now(),
          isRead: false,
          type: notification.type || 'message',
          relatedEntity: notification.chatId || notification.appointmentId,
          entityModel: notification.type === 'message' ? 'Chat' : 
                      notification.type === 'appointment' ? 'Appointment' : 
                      notification.type === 'medical' ? 'DossierMedical' : null
        };
        
        dispatch(addNotification(newNotification));
  
  // Play notification sound
  try {
    const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFzb25pY1N0dWRpb3MuY29tIA==");
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Failed to play sound:', err));
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
  
  // Show toast notification
  const toastContainer = document.getElementById('custom-toast-container');
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'custom-toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '1010';
    container.style.display = 'flex';
    container.style.flexDirection = 'column-reverse';
    container.style.maxHeight = '100vh';
    container.style.overflowY = 'auto';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }
  
  // Create simple HTML toast (no React dependency)
  const toastId = `toast-${Date.now()}`;
  const toastElement = document.createElement('div');
  toastElement.id = toastId;
  toastElement.style.marginTop = '16px';
  toastElement.style.pointerEvents = 'auto';
  toastElement.style.width = '320px';
  toastElement.style.opacity = '0';
  toastElement.style.transform = 'translateX(50px)';
  toastElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  // Add HTML content
  let iconHTML = '';
  switch (notification.type) {
    case 'message': iconHTML = '💬'; break;
    case 'appointment': iconHTML = '📅'; break;
    case 'medical': iconHTML = '📄'; break;
    default: iconHTML = '🔔';
  }
  
  toastElement.innerHTML = `
    <div style="padding: 12px; background-color: #fff; box-shadow: 0 3px 6px rgba(0,0,0,0.16); border-radius: 4px; border-left: 4px solid #1890ff; display: flex; pointer-events: auto; cursor: pointer;">
      <div style="margin-right: 12px; width: 32px; height: 32px; border-radius: 50%; background-color: #e6f7ff; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 20px;">${iconHTML}</span>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <div style="font-weight: bold;">${notification.title}</div>
          <button onclick="this.parentNode.parentNode.parentNode.remove()" style="background: none; border: none; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        <div>${notification.content}</div>
      </div>
    </div>
  `;
  
  document.getElementById('custom-toast-container').appendChild(toastElement);
  
  // Animate in
  setTimeout(() => {
    toastElement.style.opacity = '1';
    toastElement.style.transform = 'translateX(0)';
  }, 50);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (toastElement) {
      toastElement.style.opacity = '0';
      toastElement.style.transform = 'translateX(50px)';
      setTimeout(() => {
        if (toastElement && toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, 300);
    }
  }, 5000);
};

      // Register handlers after socket is connected
      socket?.on('connect', () => {
        console.log("Socket connected with ID:", socket.id);
        setSocketReady(true);
        socket.emit('authenticate', user._id);
        socket.on('newMessage', handleNewMessage);
        socket.on('newNotification', handleNewNotification);
      });
  
      // Optional: Join a room
      if (chatId && socket) {
        joinChatRoom(chatId);
      }
  
      // Clean up on unmount
      return () => {
        console.log("Cleaning up socket listeners");
        if (socket) {
          socket.off('newMessage', handleNewMessage);
          socket.off('newNotification', handleNewNotification);
          if (chatId) {
            leaveChatRoom(chatId);
          }
        }
      };
    }
  }, [dispatch, user?._id, chatId]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<SignIn />} />

          {/* Admin Routes - With clear nesting structure */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminDashboard />}>
            {/* Index route renders AdminHome */}
            <Route index element={<AdminHome />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
          </Route>
        </Route>

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard/*"
            element={<Dashboard open={sidebarOpen} setOpen={setSidebarOpen} />}
          >
            <Route index element={<Acceuil />} />
            <Route path="Acceuil" element={<Acceuil />} />
            <Route path="Patients/*" element={<Patients />} />
            <Route path="Patients/:patientId" element={<PatientPage />} />
            <Route path="Patients/:patientId/appointments" element={<AppointmentManagement />} />
            <Route path="Rendez-vous" element={<RendezVous />} />
            <Route path="Articles" element={<Articles />} />
            <Route path="Agenda" element={<Agenda />} />
            <Route path="Chats" element={<Chats />} />
            <Route path="Chats/:chatId" element={<Chats />} />
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
