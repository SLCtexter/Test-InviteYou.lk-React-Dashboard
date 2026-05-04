import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0TnX10gHHtZBcOPxNjDHaBMAFJFeqYBA",
  authDomain: "templatesdashboard-8322b.firebaseapp.com",
  projectId: "templatesdashboard-8322b",
  storageBucket: "templatesdashboard-8322b.firebasestorage.app",
  messagingSenderId: "357807396277",
  appId: "1:357807396277:web:cb789d03853b09496135fc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);