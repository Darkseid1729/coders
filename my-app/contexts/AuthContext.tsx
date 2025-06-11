"use client"

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, getAuth } from "firebase/auth"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { app } from "@/lib/firebase" // your firebase config
import type { User } from "firebase/auth"

const AuthContext = createContext({})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      // Optionally fetch user profile from backend here
    })
    return () => unsubscribe()
  }, [auth])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    // Optionally send token to backend for verification
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
