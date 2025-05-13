// Fixed socketService.js
import io from 'socket.io-client';

let socketInstance = null;

// Use localStorage to maintain logout state between page refreshes
const LOGOUT_STATE_KEY = 'user_logged_out';

// Initialize the logout state from localStorage
const getLogoutState = () => {
  return localStorage.getItem(LOGOUT_STATE_KEY) === 'true';
};

// Set the logout state in localStorage
export const setLoggedOut = (isLoggedOut) => {
  if (isLoggedOut) {
    localStorage.setItem(LOGOUT_STATE_KEY, 'true');
  } else {
    localStorage.removeItem(LOGOUT_STATE_KEY);
  }
};

export const isLoggedOut = () => {
  return getLogoutState();
};

export const initializeSocket = (user) => {
  // If we have a valid user, they must be logged in - reset the logged out flag
  if (user?._id) {
    // Reset logged out state whenever initializeSocket is called with a valid user
    setLoggedOut(false);
  }

  // Now check if user is logged out (should always be false if we have a valid user)
  if (getLogoutState()) {
    console.log('User is logged out, not initializing socket');
    return null;
  }

  if (!user?._id) {
    console.error('Cannot initialize socket without user ID');
    return null;
  }

  // Disconnect any existing socket
  if (socketInstance) {
    console.log('Disconnecting existing socket before creating new connection');
    socketInstance.disconnect();
    socketInstance = null;
  }

  console.log('Initializing socket connection for user:', user._id);
  socketInstance = io("http://localhost:3000", {
    withCredentials: true,
    auth: { userId: user._id },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socketInstance.on('connect', () => {
    console.log('Socket connected with ID:', socketInstance.id);
    socketInstance.emit('authenticate', user._id);
    console.log('Authentication emitted with user ID:', user._id);
  });

  socketInstance.on('connect_error', (err) => {
    console.error('Connection error:', err);
  });

  socketInstance.on('reconnect', (attempt) => {
    // Don't reconnect if user has logged out
    if (getLogoutState()) {
      console.log('Not reconnecting socket - user is logged out');
      socketInstance.disconnect();
      return;
    }
    
    console.log(`Socket reconnected after ${attempt} attempts`);
    socketInstance.emit('authenticate', user._id);
  });

  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socketInstance;
};

export const registerSocketHandlers = (handlers) => {
  if (!socketInstance) {
    console.error('Socket not initialized - cannot register handlers');
    return false;
  }

  // Remove existing handlers to prevent duplicates
  if (handlers.newMessage) socketInstance.off('newMessage');
  if (handlers.newNotification) socketInstance.off('newNotification');
  if (handlers.privateMessage) socketInstance.off('privateMessage');

  // Register new handlers
  if (handlers.newMessage) socketInstance.on('newMessage', handlers.newMessage);
  if (handlers.newNotification) socketInstance.on('newNotification', handlers.newNotification);
  if (handlers.privateMessage) socketInstance.on('privateMessage', handlers.privateMessage);

  return true;
};

export const sendMessage = (chatId, content, senderId) => {
  if (!socketInstance) {
    console.error('Socket not initialized - cannot send message');
    return false;
  }
  
  socketInstance.emit('sendMessage', { chatId, content, senderId });
  return true;
};

export const joinChatRoom = (chatId) => {
  if (!socketInstance) {
    console.error('Socket not initialized - cannot join chat room');
    return false;
  }
  socketInstance.emit('joinChat', chatId);
  console.log(`Joined chat room: ${chatId}`);
  return true;
};

export const leaveChatRoom = (chatId) => {
  if (!socketInstance) {
    console.error('Socket not initialized - cannot leave chat room');
    return false;
  }
  socketInstance.emit('leaveChat', chatId);
  console.log(`Left chat room: ${chatId}`);
  return true;
};

export const getSocket = () => socketInstance;

export const isSocketConnected = () => {
  return socketInstance?.connected || false;
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket from disconnectSocket()');
  
  // Set logged out flag first
  setLoggedOut(true);
  
  if (socketInstance) {
    // Perform actual socket disconnection
    socketInstance.disconnect();
    socketInstance = null;
    console.log('Socket disconnected and instance cleared');
    return true;
  }
  
  return false;
};