// Run this once to create demo accounts in Firebase
// Command: node seed_firebase_demo.mjs

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAU2quWtQ7p7imblPhR6f9s5yshWwgTBWE",
  authDomain: "agripulse-ai-69e26.firebaseapp.com",
  projectId: "agripulse-ai-69e26",
  storageBucket: "agripulse-ai-69e26.firebasestorage.app",
  messagingSenderId: "715201820558",
  appId: "1:715201820558:web:346ad6ec17de6b2adf56df"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createDemo() {
  try {
    // Demo Farmer
    const farmerCred = await createUserWithEmailAndPassword(auth, "9800000001@agripulse.farmer", "Farmer@123");
    await updateProfile(farmerCred.user, { displayName: "Demo Farmer" });
    await setDoc(doc(db, "users", farmerCred.user.uid), {
      name: "Demo Farmer", phone: "9800000001", village: "Pune Rural",
      district: "Pune", state: "Maharashtra", role: "farmer",
    });
    console.log("✅ Demo Farmer account created!");

    // Demo Buyer
    const buyerCred = await createUserWithEmailAndPassword(auth, "9900000001@agripulse.buyer", "Buyer@123");
    await updateProfile(buyerCred.user, { displayName: "Demo Buyer" });
    await setDoc(doc(db, "users", buyerCred.user.uid), {
      name: "Demo Buyer", phone: "9900000001", company: "AgriTrade Pvt Ltd",
      gst: "27AABCU9603R1ZX", state: "Maharashtra", role: "buyer",
    });
    console.log("✅ Demo Buyer account created!");

    console.log("\n🎉 Done! Demo accounts are ready.");
    console.log("   Farmer → 9800000001 / Farmer@123");
    console.log("   Buyer  → 9900000001 / Buyer@123");
    process.exit(0);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      console.log("ℹ️ Demo accounts already exist — you are good to go!");
    } else {
      console.error("❌ Error:", err.message);
    }
    process.exit(0);
  }
}

createDemo();
