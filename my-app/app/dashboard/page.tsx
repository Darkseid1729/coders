"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Users, Clock, Code, TrendingUp, Search, LogOut, Settings } from "lucide-react"

export default function DashboardPage() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)

  const [stats] = useState({
    totalSubmissions: 45,
    acceptedSubmissions: 32,
    problemsSolved: 18,
    contestsParticipated: 7,
    averageScore: 85,
    acceptanceRate: 71,
  })

  const [recentRooms] = useState([
    {
      code: "ROOM123",
      name: "Weekly Contest #42",
      participants: 24,
      status: "active",
      timeLeft: "45m",
    },
    {
      code: "ROOM456",
      name: "Algorithm Practice",
      participants: 12,
      status: "waiting",
      timeLeft: null,
    },
    {
      code: "ROOM789",
      name: "Data Structures Challenge",
      participants: 8,
      status: "completed",
      timeLeft: null,
    },
  ])

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true)
    try {
      // Simulate room creation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newRoomCode = "ROOM" + Math.random().toString(36).substr(2, 6).toUpperCase()
      router.push(`/contest/${newRoomCode}`)
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return

    setIsJoiningRoom(true)
    try {
      // Simulate room join
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/contest/${roomCode.toUpperCase()}`)
    } catch (error) {
      console.error("Failed to join room:", error)
    } finally {
      setIsJoiningRoom(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">CodeClash</h1>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={userProfile?.avatar || "/placeholder.svg"}
                  alt={userProfile?.name || "User"}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-white">{userProfile?.name}</span>
              </div>
              <Button
                onClick={() => router.push("/settings")}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-slate-400">
                  Start competing or join an existing contest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom}
                    className="h-16 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Create Room</div>
                      <div className="text-sm opacity-80">Start a new contest</div>
                    </div>
                  </Button>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button
                        onClick={handleJoinRoom}
                        disabled={isJoiningRoom || !roomCode.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">Join an existing contest room</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Rooms */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Rooms</CardTitle>
                <CardDescription className="text-slate-400">Your recent contest participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRooms.map((room) => (
                    <div
                      key={room.code}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/contest/${room.code}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Badge
                            variant={room.status === "active" ? "default" : "secondary"}
                            className={
                              room.status === "active"
                                ? "bg-green-600 text-white"
                                : room.status === "waiting"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-slate-600 text-white"
                            }
                          >
                            {room.status}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{room.name}</h4>
                          <p className="text-sm text-slate-400">Room: {room.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-slate-300 text-sm">
                          <Users className="h-4 w-4 mr-1" />
                          {room.participants}
                        </div>
                        {room.timeLeft && (
                          <div className="flex items-center text-slate-400 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {room.timeLeft}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.problemsSolved}</div>
                    <div className="text-xs text-slate-400">Problems Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.contestsParticipated}</div>
                    <div className="text-xs text-slate-400">Contests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.averageScore}</div>
                    <div className="text-xs text-slate-400">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.acceptanceRate}%</div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Submissions</span>
                    <span className="text-white">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Accepted</span>
                    <span className="text-green-400">{stats.acceptedSubmissions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Test your code with edge cases before submitting</p>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use the chat to discuss approaches with others</p>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Time bonuses reward faster submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
