import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch user profile
// In userSlice.js
// userSlice.js
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { getState }) => {
    const accessToken = getState().auth.accessToken;
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth/profile`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        // Force fresh data from server
        params: { timestamp: new Date().getTime() } 
      }
    );
    return response.data;
  }
);

// Action to update text fields
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (data, { getState, rejectWithValue, dispatch }) => {
    try {
        
      const accessToken = getState().auth.accessToken;
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/updateProfile`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
              const updatedUser = response.data.user;  // assuming the API returns user data

      dispatch({ type: 'user/clearProfile' });
      await dispatch(fetchUserProfile()); // Fetch the updated profile after updating
      return updatedUser; // Ensure correct data is returned
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update user profile");
    }
  }
);

// Action to upload the image
export const updateProfileImage = createAsyncThunk(
  "user/updateProfileImage",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/updateProfileImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update profile image");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: { clearProfile: (state) => {
    state.profile = null;
  }},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log("Updated Profile Response:", action.payload);
        state.loading = false;
        state.profile = action.payload; // Use the returned updated data
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;