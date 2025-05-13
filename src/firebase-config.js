import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkmvU2WpGF7FE2vbP5hKi35tcU2CcZlqE",
    authDomain: "e-health-77649.firebaseapp.com",
    projectId: "e-health-77649",
    storageBucket: "e-health-77649.appspot.com",
    messagingSenderId: "1051217508386",
    appId: "1:1051217508386:web:8cb368da6fdd7a0585727b",
    measurementId: "G-6D0GPTEBHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export default app;