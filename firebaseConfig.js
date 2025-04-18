// firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore' // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASECONFIG_API_KEY,
  authDomain: 'urp-project-9b5ce.firebaseapp.com',
  projectId: 'urp-project-9b5ce',
  storageBucket: 'urp-project-9b5ce.firebasestorage.app',
  messagingSenderId: '21617305638',
  appId: '1:21617305638:web:e4408319495bfaf5039ee7'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app) // Initialize Firestore

export { auth, db } // Export Firestore instance
