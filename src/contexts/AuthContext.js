import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setAccessToken(refreshResponse.data.accessToken);
          error.config.headers["Authorization"] = `Bearer ${refreshResponse.data.accessToken}`;
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

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/refreshToken`, {}, { withCredentials: true });
        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.error("No valid session found. Please log in.");
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, { withCredentials: true });
      setAccessToken(response.data.accessToken);
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
