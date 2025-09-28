import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Using existing MindWell Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyD_Owxfj8KqSjQoiY1O70mUsFiGmOeZAOY",
  authDomain: "mindwell-app-2fab5.firebaseapp.com",
  projectId: "mindwell-app-2fab5",
  storageBucket: "mindwell-app-2fab5.firebasestorage.app",
  messagingSenderId: "37636205945",
  appId: "1:37636205945:web:9de4482d59c91b45f053a8",
  measurementId: "G-2YTJ24MDFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app