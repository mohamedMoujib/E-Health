import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch chats involving the user (doctor or patient)
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async ( thunkAPI , {getState,rejectWithValue}) => {
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

      console.log("Response from fetchChats:", res.data); 
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch messages of a specific chat
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, thunkAPI) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${chatId}/messages/`

      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, type = 'text' }, thunkAPI) => {
    try {
      const { getState, rejectWithValue } = thunkAPI;
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const sendImageMessage = createAsyncThunk(
  'chat/sendImageMessage',
  async ({ chatId, file }, thunkAPI) => {
    try {
      const { getState, rejectWithValue } = thunkAPI;
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);


export const fetchMessageById = createAsyncThunk(
  'chat/fetchMessageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages/message/${id}`);
      return response.data; // Return the message details
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createChat = createAsyncThunk(
    'chat/createChat',
    async ({ doctorId, patientId }, thunkAPI) => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/chat/createChat`, {  doctorId,  patientId });
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
        state.selectedChat = action.payload;
      },
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
          state.messages.push(action.payload); // Add new message to messages list
        })
        .addCase(sendMessage.rejected, (state, action) => {
          state.loading.sending = false;
          state.error.sending = action.payload;
        })
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
          .addCase(fetchMessageById.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchMessageById.fulfilled, (state, action) => {
            state.loading = false;
            state.messages[action.payload._id] = action.payload;
          })
          .addCase(fetchMessageById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Send image message
          .addCase(sendImageMessage.pending, (state) => {
            state.loading.sending = true;
            state.error.sending = null;
          })
          .addCase(sendImageMessage.fulfilled, (state, action) => {
            state.loading.sending = false;
            state.messages.push(action.payload); // Ajouter à la liste des messages
          })
          .addCase(sendImageMessage.rejected, (state, action) => {
            state.loading.sending = false;
            state.error.sending = action.payload;
          });
    },
  });
  
  export const { clearMessages, setSelectedChat } = chatSlice.actions;
  
  export default chatSlice.reducer;