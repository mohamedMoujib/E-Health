import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { useSelector } from "react-redux";
//Async thunk for fetching patients list
export const fetchPatientsList = createAsyncThunk(
    'patients/fetchPatientsList',
    async (_, {getState,rejectWithValue}) => {
        try{
            const doctorId = getState().user.profile?._id; 
            console.log("Doctor ID:", doctorId);

            const accessToken = getState().auth.accessToken;
            if (!doctorId) {
                return rejectWithValue("Doctor ID is missing");
            }
            if (!accessToken) {
                return rejectWithValue("No access token available");
            }
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctors/${doctorId}/patients`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            );
            console.log("Fetched patients:", response.data);
            return response.data;
        }catch (error) {
            return rejectWithValue(error.message);
            
        }
    }
)

// Async thunk for fetching a single patient by ID
export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (patientId, { getState, rejectWithValue }) => {
      try {
          const accessToken = getState().auth.accessToken;
          if (!accessToken) {
              return rejectWithValue("No access token available");
          }

          const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/patients/${patientId}`,
              {
                  headers: { Authorization: `Bearer ${accessToken}` },
              }
          );

          return response.data;
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState: {
      list: [],
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null,
      currentPatient: null,
  },
  reducers: {
      setCurrentPatient: (state, action) => {
          state.currentPatient = action.payload;
      },
      clearCurrentPatient: (state) => {
          state.currentPatient = null;
      },
  },
  extraReducers: (builder) => {
      builder
          // Fetch all patients
          .addCase(fetchPatientsList.pending, (state) => {
              state.status = 'loading';
          })
          .addCase(fetchPatientsList.fulfilled, (state, action) => {
              state.status = 'succeeded';
              state.list = action.payload;
              state.error = null;
          })
          .addCase(fetchPatientsList.rejected, (state, action) => {
              state.status = 'failed';
              state.error = action.payload;
          })
          // Fetch a single patient by ID
          .addCase(fetchPatientById.pending, (state) => {
              state.status = 'loading';
          })
          .addCase(fetchPatientById.fulfilled, (state, action) => {
              state.status = 'succeeded';
              state.currentPatient = action.payload;
              state.error = null;
          })
          .addCase(fetchPatientById.rejected, (state, action) => {
              state.status = 'failed';
              state.error = action.payload;
          });
  },
});

export const { setCurrentPatient, clearCurrentPatient } = patientsSlice.actions;
export default patientsSlice.reducer;
