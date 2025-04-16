import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const addPrivateEngagement = createAsyncThunk(
  'privateEngagements/add',
  async ({  description, startDate, endDate }, { rejectWithValue, getState }) => {
    try {
        const accessToken = getState().auth.accessToken;
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/private-engagements`, 

        {
        description,
        startDate,
        endDate
      }
        , {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePrivateEngagement = createAsyncThunk(
  'privateEngagements/update',
  async ({ id, description, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/private-engagements/${id}`, {
        description,
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePrivateEngagement = createAsyncThunk(
  'privateEngagements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/private-engagements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPrivateEngagements = createAsyncThunk(
  'privateEngagements/fetch',
  async (_, { rejectWithValue,getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/private-engagements/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }

      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const privateEngagementSlice = createSlice({
  name: 'privateEngagements',
  initialState: {
    engagements: [],
    status: 'idle',
    error: null,
    conflictError: null
  },
  reducers: {
    clearConflictError: (state) => {
      state.conflictError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Private Engagement
      .addCase(addPrivateEngagement.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addPrivateEngagement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.engagements.push(action.payload.engagement);
      })
      .addCase(addPrivateEngagement.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload?.message?.includes('confirmed appointments')) {
          state.conflictError = action.payload.message;
        } else {
          state.error = action.payload?.message || action.error.message;
        }
      })

      // Update Private Engagement
      .addCase(updatePrivateEngagement.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePrivateEngagement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.engagements.findIndex(
          e => e._id === action.payload.engagement._id
        );
        if (index !== -1) {
          state.engagements[index] = action.payload.engagement;
        }
      })
      .addCase(updatePrivateEngagement.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload?.message?.includes('confirmed appointments')) {
          state.conflictError = action.payload.message;
        } else {
          state.error = action.payload?.message || action.error.message;
        }
      })

      // Delete Private Engagement
      .addCase(deletePrivateEngagement.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePrivateEngagement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.engagements = state.engagements.filter(
          e => e._id !== action.payload
        );
      })
      .addCase(deletePrivateEngagement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.error.message;
      })

      // Fetch Private Engagements
      .addCase(fetchPrivateEngagements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPrivateEngagements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.engagements = action.payload.engagements;
      })
      .addCase(fetchPrivateEngagements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.error.message;
      });
  }
});

export const { clearConflictError } = privateEngagementSlice.actions;

export default privateEngagementSlice.reducer;