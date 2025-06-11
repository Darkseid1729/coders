"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Code, Users, Trophy, Zap } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const authContext = useAuth() as { signIn?: () => Promise<void> } | null
  const signIn = authContext?.signIn
  const router = useRouter()

  const handleSignIn = async () => {
    if (!signIn) {
      console.error("signIn function is not available from AuthContext")
      return
    }
    try {
      setIsLoading(true)
      await signIn()
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-white">
              Code<span className="text-purple-400">Clash</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md mx-auto lg:mx-0">
              Real-time coding contests that bring developers together
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Code className="h-8 w-8 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold">Live Coding</h3>
              <p className="text-slate-400 text-sm">Real-time code execution</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Users className="h-8 w-8 text-green-400 mb-2" />
              <h3 className="text-white font-semibold">Multiplayer</h3>
              <p className="text-slate-400 text-sm">Compete with others</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Trophy className="h-8 w-8 text-yellow-400 mb-2" />
              <h3 className="text-white font-semibold">Leaderboards</h3>
              <p className="text-slate-400 text-sm">Track your progress</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Zap className="h-8 w-8 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold">Real-time</h3>
              <p className="text-slate-400 text-sm">Instant feedback</p>
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <Card className="bg-slate-800 border-slate-700 max-w-md mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to join coding contests and compete with developers worldwide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12"
            >
              <Chrome className="h-5 w-5 mr-3" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                New to CodeClash? <span className="text-purple-400">Create an account automatically</span>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-500 space-y-1">
                <p>✓ Secure authentication with Firebase</p>
                <p>✓ Real-time contest participation</p>
                <p>✓ Track your coding progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
