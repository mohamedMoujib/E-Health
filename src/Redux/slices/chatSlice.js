import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { joinChatRoom, leaveChatRoom } from '../../services/socketService';

// Socket instance to be used across the app




// Fetch chats involving the user (doctor or patient)
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/chat/chats/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch messages of a specific chat
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/messages/${chatId}/messages/`
        
      );
      
      // Join socket room for this chat
      joinChatRoom(chatId);
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, type = 'text' }, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;

      if (!accessToken) {
        return rejectWithValue("No access token available");
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages/send`,
        {
          content,
          chatId,
          type
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const sendImageMessage = createAsyncThunk(
  'chat/sendImageMessage',
  async ({ chatId, file }, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;

      if (!accessToken) {
        return rejectWithValue("No access token available");
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('chatId', chatId);
      formData.append('type', 'image');

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages/send-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async ({ doctorId, patientId }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth.accessToken;
      if (!accessToken) {
        return thunkAPI.rejectWithValue("No access token available");
      }
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/chat/createChat`, 
        { doctorId, patientId }
        
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  chats: [],
  messages: [],
  selectedChat: null,
  loading: {
    chats: false,
    messages: false,
    sending: false
  },
  error: {
    chats: null,
    messages: null,
    sending: null
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    setSelectedChat: (state, action) => {
      // Leave previous chat room if exists
      if (state.selectedChat?._id) {
        leaveChatRoom(state.selectedChat._id);
      }
      state.selectedChat = action.payload;
      // Join new chat room if exists
      if (action.payload?._id) {
        joinChatRoom(action.payload._id);
      }
    },
    // New reducer to handle socket messages
    newMessageReceived: (state, action) => {
      const message = action.payload;
      
      // Always add message to messages array if it's for the selected chat
      if (state.selectedChat && message.chat === state.selectedChat._id) {
        // Check if message already exists to avoid duplicates
        const messageExists = state.messages.some(msg => msg._id === message._id);
        if (!messageExists) {
          state.messages = [...state.messages, message];
        }
      }
      
      // Update the last message in chat list
      const chatIndex = state.chats.findIndex(chat => chat._id === message.chat);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = {
          _id: message._id,
          content: message.content,
          timestamp: message.timestamp
        };
      }
    },
    updateChatList: (state, action) => {
      // Update the chat list with a single chat (typically with unread count)
      const updatedChat = action.payload;
      const index = state.chats.findIndex(chat => chat._id === updatedChat._id);
      if (index !== -1) {
        state.chats[index] = updatedChat;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats
      .addCase(fetchChats.pending, (state) => {
        state.loading.chats = true;
        state.error.chats = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading.chats = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading.chats = false;
        state.error.chats = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error.messages = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error.messages = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Message will be added via socket
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      })
      
      // Create chat
      .addCase(createChat.pending, (state) => {
        state.loading.chats = true;
        state.error.chats = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading.chats = false;
        state.chats.push(action.payload); // Add new chat to the list
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading.chats = false;
        state.error.chats = action.payload;
      })
      
      // Send image message
      .addCase(sendImageMessage.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(sendImageMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Message will be added via socket
      })
      .addCase(sendImageMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });
  },
});

export const { clearMessages, setSelectedChat, newMessageReceived, updateChatList } = chatSlice.actions;

export default chatSlice.reducer;