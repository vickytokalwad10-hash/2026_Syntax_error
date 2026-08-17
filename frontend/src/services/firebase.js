// AgriPulse AI v2.1 - Firebase Auth Build
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAU2quWtQ7p7imblPhR6f9s5yshWwgTBWE",
  authDomain: "agripulse-ai-69e26.firebaseapp.com",
  projectId: "agripulse-ai-69e26",
  storageBucket: "agripulse-ai-69e26.firebasestorage.app",
  messagingSenderId: "715201820558",
  appId: "1:715201820558:web:346ad6ec17de6b2adf56df",
  measurementId: "G-SBG07VLXG3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
