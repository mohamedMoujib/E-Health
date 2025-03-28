import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Action pour récupérer les rendez-vous d'un patient
export const fetchAppointmentsByPatient = createAsyncThunk(
  'appointments/fetchAppointmentsByPatient',
  async (patientId, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/doctors/patientAppointments/${patientId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data.appointments;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur serveur");
    }
  }
);

// Action pour récupérer les rendez-vous détaillés d'un patient
export const fetchAppointmentsWithDetails = createAsyncThunk(
  "appointments/fetchAppointmentsWithDetails",
  async (patientId, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/appointmentsDetails/${patientId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur serveur");
    }
  }
);

export const getAvailableSlots = createAsyncThunk(
  "appointments/getAvailableSlots",
  async (date, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      const doctorId = getState().user.profile._id;
      console.log("Doctor ID...:", doctorId);

      if (!accessToken) {
        throw new Error("Token d'accès manquant.");
      }
      if (!doctorId) {
        throw new Error("ID du médecin non disponible.");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/${date}/slots`,
        {
          params: { doctorId },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée :", error);
      return rejectWithValue(error.response?.data || "Erreur serveur");
    }
  }
);
export const bookAppointment = createAsyncThunk(
  "appointments/bookAppointment",
  async ({  date, time, type, patientId }, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      const doctorId = getState().user.profile._id; // Assure-toi que `user.id` est bien défini !


      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments/book`,
        { doctorId, date, time, type, patientId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur serveur");
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [], // Liste des rendez-vous simples
    detailedAppointments: [], // Liste des rendez-vous avec détails
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion de fetchAppointmentsByPatient
      .addCase(fetchAppointmentsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Gestion de fetchAppointmentsWithDetails
      .addCase(fetchAppointmentsWithDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsWithDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.detailedAppointments = action.payload;
      })
      .addCase(fetchAppointmentsWithDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments=[...state.appointments,action.payload];
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default appointmentSlice.reducer;
