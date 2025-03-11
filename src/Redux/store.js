import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';




// Allow non-serializable values for redux-persist actions

export const store = configureStore({
  
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
 
});

