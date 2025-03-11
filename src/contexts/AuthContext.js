import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {useDispatch} from 'react-redux';
import {setAccesstoken, clearAccessToken} from '../Redux/slices/authSlice';


const API_URL = process.env.REACT_APP_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
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

  // Check and refresh token on page load
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        console.log("Attempting to refresh token...");
        const refreshResponse = await axios.post(`${API_URL}/auth/refreshToken`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;
        console.log("Refresh successful:", refreshResponse.data.accessToken);

        setAccessToken(refreshResponse.data.accessToken); // Set access token from refresh token
        dispatch(setAccesstoken(newAccessToken));

      } catch (error) {
        console.error("Refresh failed:", error.response?.data?.message || error.message);
        console.error("No valid refresh token found. Please log in again.");
        setAccessToken(null);
        dispatch(clearAccessToken());
      } finally {
        setLoading(false);
      }
    };

    checkAndRefreshToken();
  }, [dispatch]);


  const login = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, { withCredentials: true });
      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      dispatch(setAccesstoken(newAccessToken));
      return response.data;
    } catch (error) {
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

  const logout = () => {
    setAccessToken(null);
    dispatch(clearAccessToken()); // Clear Redux state
    axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, signup, loading, axiosInstance }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
