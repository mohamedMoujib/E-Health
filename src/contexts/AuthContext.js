import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {useDispatch} from 'react-redux';
import {setAccesstoken, clearAccessToken, setrole, clearRole} from '../Redux/slices/authSlice';
import { disconnectSocket, setLoggedOut } from '../services/socketService';
import { clearNotifications } from '../Redux/slices/notificationSlice';

const API_URL = process.env.REACT_APP_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Enables cookies for refresh token
  });

  // Attach access token to requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle token expiration by refreshing
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          const refreshResponse = await axios.post(`${API_URL}/auth/refreshToken`, {}, { withCredentials: true });
          const newAccessToken = refreshResponse.data.accessToken;
          setAccessToken(newAccessToken);
          dispatch(setAccesstoken(newAccessToken));
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(error.config); // Retry request with new token
        } catch (refreshError) {
          console.error("Session expired. Please log in again.");
          logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
// if (newRole !== "doctor" && newRole !== "admin") {
      //   throw new Error(`You are trying to log in as a doctor, but this account is a ${newRole}.`);
      // }
  // Check and refresh token on page load
// Check and refresh token on page load
useEffect(() => {
  const checkAndRefreshToken = async () => {
    // Multiple checks to prevent auto-login after logout
    const isLoggedOut = localStorage.getItem('isLoggedOut') === 'true';
    const hasNoToken = !localStorage.getItem('accessToken');
    const currentUrl = window.location.pathname;
    const isLoginPage = currentUrl === '/signin' || currentUrl === '/login';
    
    // Skip token refresh if:
    // 1. User is explicitly logged out OR
    // 2. User is on login page OR
    // 3. We don't have any token in local storage
    if (isLoggedOut || isLoginPage || hasNoToken) {
      console.log("Skipping token refresh because:", 
                  isLoggedOut ? "User is logged out" : 
                  isLoginPage ? "User is on login page" : 
                  "No token in storage");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Attempting token refresh...");
      
      // Add a check to prevent refresh loops
      const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt');
      const now = Date.now();
      
      // If we've tried refreshing in the last 5 seconds, skip
      if (lastRefreshAttempt && (now - parseInt(lastRefreshAttempt)) < 5000) {
        console.log("Skipping refresh - too soon since last attempt");
        setLoading(false);
        return;
      }
      
      // Set last refresh attempt timestamp
      localStorage.setItem('lastRefreshAttempt', now.toString());
      
      const refreshResponse = await axios.post(
        `${API_URL}/auth/refreshToken`, 
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      console.log("Refresh token response:", refreshResponse.data);
      
      if (!refreshResponse.data || !refreshResponse.data.accessToken) {
        throw new Error("Invalid refresh response");
      }
      
      const newAccessToken = refreshResponse.data.accessToken;
      const newRole = refreshResponse.data.role;

      // Store token in localStorage for our checking logic
      localStorage.setItem('accessToken', newAccessToken);
      
      setAccessToken(newAccessToken);
      setRole(newRole);
      dispatch(setAccesstoken(newAccessToken));
      dispatch(setrole(newRole));
    } catch (error) {
      console.error("Refresh failed:", error.response?.data?.message || error.message);
      
      // If refresh fails, make sure we're fully logged out
      localStorage.removeItem('accessToken');
      localStorage.setItem('isLoggedOut', 'true');
      
      setAccessToken(null);
      setRole(null);
      dispatch(clearAccessToken());
      dispatch(clearRole());
      
      // Redirect to login page if not already there
      if (!isLoginPage) {
        console.log("Redirecting to login due to failed token refresh");
        window.location.replace('/signin');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  checkAndRefreshToken();
}, [dispatch]);

const login = async (formData) => {
  try {
    // Clear any logged out state
    localStorage.removeItem('isLoggedOut');
    localStorage.removeItem('lastRefreshAttempt');
    
    // Clear any existing tokens
    setAccessToken(null);
    setRole(null);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, { 
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    const newAccessToken = response.data.accessToken;
    const newRole = response.data.role;
    
    console.log("Login successful:", newAccessToken);
    console.log("User role:", newRole);
    
    // Store token in localStorage for our checking logic
    localStorage.setItem('accessToken', newAccessToken);
    
    // Update state and Redux
    setAccessToken(newAccessToken);
    setRole(newRole); 
    dispatch(setrole(newRole));
    dispatch(setAccesstoken(newAccessToken));
    
    return response.data;
  } catch (error) {
    // Clean up on login failure
    localStorage.setItem('isLoggedOut', 'true');
    localStorage.removeItem('accessToken');
    throw error.response?.data?.message || "Authentication failed";
  }
};

  // Signup function
  const signup = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Une erreur est survenue.";
    }
  };

  const logout = async () => {
    try {
      console.log("Initiating logout...");
  
      // Disconnect socket if used
      if (typeof disconnectSocket === 'function') disconnectSocket();
  
      // Clean localStorage and sessionStorage
      localStorage.removeItem('accessToken');
      localStorage.setItem('isLoggedOut', 'true');
      sessionStorage.clear();
  
      // Dispatch Redux actions
      dispatch(clearAccessToken());
      dispatch(clearRole());
      dispatch(clearNotifications());
  
      // Manually clear client cookies (limited in scope)
      const cookieNames = ['refreshToken', 'accessToken', 'token'];
      cookieNames.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
      });
  
      // Send logout request to server to clear HttpOnly refresh token
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
  
      console.log("Logout successful");
  
      // Optional redirect
      window.location.replace("/signin");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    }
  };
  
  

  // Get the user data including role
  const getCurrentUser = async () => {
    if (!accessToken) return null;
    
    try {
      const response = await axiosInstance.get(`${API_URL}/users/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken,
      role, 
      login, 
      logout, 
      signup, 
      loading, 
      axiosInstance,
      getCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);