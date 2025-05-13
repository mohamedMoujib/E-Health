import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunks to handle async actions
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      return response.data.notifications || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteNotificationAsync = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action) {
      const notification = state.notifications.find(n => 
        n._id === action.payload || n.notificationId === action.payload
      );
      
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    deleteNotification(state, action) {
      const id = action.payload;
      const deletedNotification = state.notifications.find(n => 
        n._id === id || n.notificationId === id
      );
      const wasUnread = deletedNotification && !deletedNotification.isRead;

      state.notifications = state.notifications.filter(n => 
        n._id !== id && n.notificationId !== id
      );

      if (wasUnread) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.loading = false;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      
      // Handle markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find(n => 
          n._id === id || n.notificationId === id
        );
        
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Handle markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      
      // Handle deleteNotificationAsync
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        const id = action.payload;
        const deletedNotification = state.notifications.find(n => 
          n._id === id || n.notificationId === id
        );
        const wasUnread = deletedNotification && !deletedNotification.isRead;

        state.notifications = state.notifications.filter(n => 
          n._id !== id && n.notificationId !== id
        );

        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
  }
});

export const {
  addNotification,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  setNotifications,
  clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;