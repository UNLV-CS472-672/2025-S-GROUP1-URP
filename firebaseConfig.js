// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJCwZZjxg-wXxvnEv6Q4gwCwsrcJ4-7Hw",
  authDomain: "urp-project-9b5ce.firebaseapp.com",
  projectId: "urp-project-9b5ce",
  storageBucket: "urp-project-9b5ce.firebasestorage.app",
  messagingSenderId: "21617305638",
  appId: "1:21617305638:web:e4408319495bfaf5039ee7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; // Export Firestore instance