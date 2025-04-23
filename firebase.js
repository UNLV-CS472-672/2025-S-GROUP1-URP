import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Replace these with your Firebase project configuration details
const firebaseConfig = {
  apiKey: 'AIzaSyCATKript_QQeYBBoA4EFUi08va3oYj0zU',
  authDomain: 'fir-group1-urp.firebaseapp.com',
  projectId: 'fir-group1-urp',
  storageBucket: 'fir-group1-urp.firebasestorage.app',
  messagingSenderId: '270969593795',
  appId: '1:270969593795:web:254e128bee69dda8f02776',
  measurementId: 'G-ZNWW7RH43P'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
// const analytics = getAnalytics(app)

export { auth }
