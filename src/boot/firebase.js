import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBGHG0SoCEiHtJkjCuUPgPrY6MyGAlhOG4',
  authDomain: 'cinematic-483f3.firebaseapp.com',
  projectId: 'cinematic-483f3',
  storageBucket: 'cinematic-483f3.firebasestorage.app',
  messagingSenderId: '827203897819',
  appId: '1:827203897819:web:b89930d05ff1d652457ffe',
}

// Initialize Firebase
console.log('Initializing Firebase...')
const app = initializeApp(firebaseConfig)
console.log('Firebase initialized successfully')

// Initialize Firebase Auth
console.log('Initializing Firebase Auth...')
const auth = getAuth(app)
console.log('Firebase Auth initialized successfully')

// Initialize Google Auth Provider
console.log('Initializing Google Auth Provider...')
const googleProvider = new GoogleAuthProvider()
console.log('Google Auth Provider initialized successfully')

export { auth, googleProvider }
