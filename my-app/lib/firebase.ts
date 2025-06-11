import { initializeApp, getApps } from "firebase/app"
// Optionally import getAnalytics if you use it in the browser
// import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Only initialize once
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// Optionally, only in browser:
// if (typeof window !== "undefined") {
//   getAnalytics(app)
// }

export { type User, onAuthStateChanged, signInWithGoogle as signInWithPopup, signOut as logOut } from "./auth-mock"

// Mock Firebase objects for compatibility
export const auth = {
  currentUser: null,
}

export const googleProvider = {}
