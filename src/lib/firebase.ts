import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCeronGR3f4wS4YBjL0LPawmsuyYNRh5j8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tubeseopro-748b9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tubeseopro-748b9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tubeseopro-748b9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944968573926",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:944968573926:web:fd74beb82001dc95262c27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
