import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import patientsReducer from './slices/patientsSlice';
import appointmentReducer from './slices/appointmentSlice';
import medicalFileReducer from './slices/medicalFileSlice';
import chatReducer from './slices/chatSlice';
import articlesReducer from './slices/articlesSlice';
// Allow non-serializable values for redux-persist actions

export const store = configureStore({
  
  reducer: {
    auth: authReducer,
    user: userReducer,
    patients:patientsReducer,
    appointments:appointmentReducer,
    medicalFile: medicalFileReducer,
    chat: chatReducer,
    articles: articlesReducer,

  },
 
});

