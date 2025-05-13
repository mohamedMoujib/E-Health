// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    role: null,
  },
  reducers: {
    setAccesstoken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearAccessToken: (state) => {
      state.accessToken = null;
    },
    setrole: (state, action) => {
      state.role = action.payload;
    },
    clearRole: (state) => {
      state.role = null;
    },
  },
});

export const { setAccesstoken, clearAccessToken,setrole,clearRole } = authSlice.actions;
export default authSlice.reducer;