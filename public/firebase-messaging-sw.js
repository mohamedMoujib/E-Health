// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAkmvU2WpGF7FE2vbP5hKi35tcU2CcZlqE",
  authDomain: "e-health-77649.firebaseapp.com",
  projectId: "e-health-77649",
  messagingSenderId: "1051217508386",
  appId: "1:1051217508386:web:8cb368da6fdd7a0585727b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
