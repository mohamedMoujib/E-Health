import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



// 1. Add Note to a Medical File
export const addNote = createAsyncThunk(
  'medicalFile/addNote',
  async ({  titre, content, appointmentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/medicalFiles/note/`,
        { titre, content, appointmentId }
      );
      return response.data.note; // return the note object
    } catch (error) {
      return rejectWithValue(error.response.data); // handle errors
    }
  }
);

// 2. Add Prescription to a Medical File
export const addPrescription = createAsyncThunk(
  'medicalFile/addPrescription',
  async ({  description, appointmentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/medicalFiles/prescription/`,
        { description, appointmentId }
      );
      return response.data.prescription; // return the prescription object
    } catch (error) {
      return rejectWithValue(error.response.data); // handle errors
    }
  }
);

// 3. Add Document to a Medical File
export const addDocument = createAsyncThunk(
    "medicalFile/addDocument",
    async ({ title, file, description, appointmentId }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("appointmentId", appointmentId);
        if (file) {
          formData.append("image", file); // Ajouter l’image
        }
  
        console.log("Données envoyées à l'API :", formData);
  
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/medicalFiles/document/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
  
        return response.data.document;
      } catch (error) {
        console.error("Erreur API:", error.response?.data);
        return rejectWithValue(error.response?.data || { message: "Erreur inconnue" });
      }
    }
  );
  

// 4. Add Diet to a Medical File
export const addDiet = createAsyncThunk(
  'medicalFile/addDiet',
  async ({  dietType, description, appointmentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/medicalFiles/diet/`,
        { dietType, description, appointmentId }
      );
      return response.data.diet; // return the diet object
    } catch (error) {
      return rejectWithValue(error.response.data); // handle errors
    }
  }
);

// 5. Get Appointment Details
export const fetchAppointmentDetails = createAsyncThunk(
    'medicalFile/fetchAppointmentDetails',
    async (appointmentId, { rejectWithValue }) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/appointmentDetails/${appointmentId}`
        );
        return response.data; // Returns detailed appointment object
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch appointment details' });
      }
    }
  );
  // Async thunk for updating appointment status
export const updateAppointmentStatus = createAsyncThunk(
    'medicalFile/updateAppointmentStatus',
    async ({ appointmentId, status }, { rejectWithValue }) => {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}/update`, { status });
        return response.data.appointment;
      } catch (error) {
        console.error('Update Appointment Error:', error.response?.data || error.message);

        return rejectWithValue(error.response.data);
      }
    }
  );

// Define the initial state
const initialState = {
  notes: [],
  prescriptions: [],
  documents: [],
  diets: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

// Create the slice
const medicalFileSlice = createSlice({
  name: 'medicalFile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 1. Add note to medical file
      .addCase(addNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.push(action.payload); // add the new note to the notes array
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2. Add prescription to medical file
      .addCase(addPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions.push(action.payload); // add the new prescription
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 3. Add document to medical file
      .addCase(addDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload); // add the new document
      })
      .addCase(addDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4. Add diet to medical file
      .addCase(addDiet.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDiet.fulfilled, (state, action) => {
        state.loading = false;
        state.diets.push(action.payload); // add the new diet
      })
      .addCase(addDiet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 5. Fetch Appointment Details
      .addCase(fetchAppointmentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
        
        // Optionally, update the existing arrays with fetched data
        state.notes = action.payload.notes || [];
        state.prescriptions = action.payload.prescriptions || [];
        state.documents = action.payload.documents || [];
        state.diets = action.payload.dietPlans || [];
      })
      .addCase(fetchAppointmentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAppointment = null;
      })
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
  },
});

export default medicalFileSlice.reducer;

