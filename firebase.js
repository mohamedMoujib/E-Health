const admin = require('firebase-admin');
const serviceAccount = require('./e-health-77649-firebase-adminsdk-fbsvc-a5108f98d3.json'); // Replace with the path to your service account key file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://e-health-77649.firebaseio.com' // Replace with your actual database URL
});

module.exports = admin;
/*// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkmvU2WpGF7FE2vbP5hKi35tcU2CcZlqE",
  authDomain: "e-health-77649.firebaseapp.com",
  projectId: "e-health-77649",
  storageBucket: "e-health-77649.firebasestorage.app",
  messagingSenderId: "1051217508386",
  appId: "1:1051217508386:web:8cb368da6fdd7a0585727b",
  measurementId: "G-6D0GPTEBHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission to send notifications
getToken(messaging, { vapidKey: 'NVDk6fTRuPAmRio3B9WoHyqnAeZDHxKkmTt8Jc_5rFc' }).then((currentToken) => {
  if (currentToken) {
    console.log('FCM Token:', currentToken);
    // Send the token to your server and save it in the user model
    saveTokenToServer(currentToken);
  } else {
    console.log('No registration token available. Request permission to generate one.');
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
});

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Display the notification to the user
  displayNotification(payload);
});

// Function to send the FCM token to your server
function saveTokenToServer(token) {
  fetch('/api/save-fcm-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  }).then(response => {
    if (response.ok) {
      console.log('FCM token saved successfully.');
    } else {
      console.log('Failed to save FCM token.');
    }
  }).catch(error => {
    console.log('Error saving FCM token:', error);
  });
}

// Function to display the notification to the user
function displayNotification(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  if (Notification.permission === 'granted') {
    new Notification(notificationTitle, notificationOptions);
  }
}*/