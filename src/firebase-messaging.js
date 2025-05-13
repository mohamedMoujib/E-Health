import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { messaging as firebaseMessaging } from './firebase-config';
import { store } from './Redux/store.js';

const VAPID_KEY = 'BFslVrtXjiDDIpT-fO1pdhCUeM_NkGv8WjhF5eGXKJoU7QKgnxF8Xcp060FUMdQMylOOWFnCJCyoOC1u5hLmyFg';

// Register service worker first, separate from token request
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('Service Worker registered successfully', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Helper function to get access token from Redux store
const getAccessToken = () => {
  const state = store.getState();
  return state.auth.accessToken;
};

// Request notification permission
export const requestNotificationPermission = async (userId) => {
  try {
    if (Notification.permission === 'granted') {
      return getAndSaveFCMToken(userId);
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      return getAndSaveFCMToken(userId);
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Get FCM token and save to server
export const getAndSaveFCMToken = async (userId) => {
  try {
    // Get the service worker registration - must be done before token retrieval
    const swRegistration = await navigator.serviceWorker.ready;
    console.log('Using service worker registration:', swRegistration);
    
    // Try getting the token with proper error handling
    console.log('Requesting FCM token with VAPID key...');
    const currentToken = await getToken(firebaseMessaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    }).catch(error => {
      console.error('Detailed FCM token error:', error.code, error.message);
      throw error; // Re-throw to be caught by outer try-catch
    });

    if (currentToken) {
      console.log('FCM token obtained successfully:', currentToken);
      
      // Get access token from Redux store
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error('Cannot save FCM token: No access token available');
        return null;
      }
      
      // Save token to server
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/save-fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token: currentToken, userId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save token: ${response.status} ${response.statusText}`);
      }
      
      console.log('FCM token saved to server successfully');
      return currentToken;
    }
    
    console.log('No registration token available.');
    return null;
  } catch (error) {
    console.error('Error getting or saving FCM token:', error);
    return null;
  }
};

// Set up message handler for foreground notifications
export const setupMessageHandler = () => {
  onMessage(firebaseMessaging, (payload) => {
    console.log('Message received in foreground:', payload);
    displayNotification(payload);
  });
};

// Function to display the notification
function displayNotification(payload) {
  const isChatNotification = payload.data?.type === 'chat';
  const title = isChatNotification 
    ? `New message from ${payload.data.senderName}`
    : payload.notification?.title || 'New Notification';

  const options = {
    body: isChatNotification 
      ? payload.data.message || 'You have a new message'
      : payload.notification?.body,
    icon: payload.data?.senderImage || '/notification-icon.png',
    data: payload.data
  };

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, options);
    
    notification.onclick = function() {
      window.focus();
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
      notification.close();
    };
  }
}

// Delete FCM token on logout
export const deleteFCMToken = async () => {
  try {
    await deleteToken(firebaseMessaging);
    
    // Get access token from Redux store
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error('Cannot delete server FCM token: No access token available');
      return;
    }
    
    await fetch(`${process.env.REACT_APP_API_URL}/notifications/delete-fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('FCM token deleted successfully');
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

// Periodically check for token changes
export const setupTokenRefresh = (userId) => {
  const checkToken = async () => {
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(firebaseMessaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      });
      
      if (currentToken) {
        console.log('Token refresh check:', currentToken);
        
        const accessToken = getAccessToken();
        if (!accessToken) {
          console.warn('Cannot save refreshed FCM token: No access token available');
          return;
        }
        
        await fetch(`${process.env.REACT_APP_API_URL}/notifications/save-fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ token: currentToken, userId })
        });
      }
    } catch (error) {
      console.error('Error during token refresh:', error);
    }
  };

  // Check immediately
  checkToken();
  
  // Then check every 12 hours
  const intervalId = setInterval(checkToken, 12 * 60 * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};