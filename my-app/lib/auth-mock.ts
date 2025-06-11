export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

class MockAuth {
  private listeners: ((user: User | null) => void)[] = []
  private currentUser: User | null = null

  constructor() {
    // Check for existing session
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("codeclash_user")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
      }
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback)
    // Immediately call with current state
    callback(this.currentUser)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  async signInWithGoogle(): Promise<{ user: User }> {
    // Simulate Google sign-in
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      uid: `user_${Date.now()}`,
      email: "demo@codeclash.com",
      displayName: "Demo User",
      photoURL: "/placeholder.svg?height=32&width=32",
    }

    this.currentUser = mockUser

    if (typeof window !== "undefined") {
      localStorage.setItem("codeclash_user", JSON.stringify(mockUser))
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(mockUser))

    return { user: mockUser }
  }

  async signOut(): Promise<void> {
    this.currentUser = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("codeclash_user")
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(null))
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async getIdToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error("No user signed in")
    }
    // Return a mock token
    return `mock_token_${this.currentUser.uid}_${Date.now()}`
  }
}

export const mockAuth = new MockAuth()

// Export functions that match Firebase Auth API
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return mockAuth.onAuthStateChanged(callback)
}

export const signInWithGoogle = () => mockAuth.signInWithGoogle()
export const signOut = () => mockAuth.signOut()
