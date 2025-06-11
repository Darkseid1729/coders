"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { socketService } from "@/lib/socket"
import { Leaderboard } from "@/components/leaderboard"
import { ChatPanel } from "@/components/chat-panel"
import { ContestTimer } from "@/components/contest-timer"
import { ProblemStatement } from "@/components/problem-statement"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Trophy, MessageCircle, ArrowLeft } from "lucide-react"
import { AdvancedCodeEditor } from "@/components/advanced-code-editor"
import { ConnectionStatus } from "@/components/connection-status"
import { NotificationSystem, useNotifications } from "@/components/notification-system"

export default function ContestRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile } = useAuth() as { user: any; userProfile: any }
  const roomCode = params.roomCode as string

  const [isContestActive, setIsContestActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 1 hour in seconds
  const [participants, setParticipants] = useState(1)
  const [roomData, setRoomData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([]) // Add this state
  const hasJoinedRoom = useRef(false) // Prevent duplicate room join notifications

  const { notifications, addNotification, removeNotification } = useNotifications()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Only join room once per session/tab
    if (socketService.isSocketConnected() && !hasJoinedRoom.current) {
      socketService.joinRoom(roomCode)
      hasJoinedRoom.current = true
    }

    // Set up socket event listeners
    const socket = socketService.getSocket()
    if (socket) {
      socket.on("room_joined", (data) => {
        setRoomData(data)
        setParticipants(data.participants?.length || 1)
        setIsConnected(true)

        // Only show notification once
        if (!hasJoinedRoom.current) {
          addNotification({
            type: "success",
            title: "Room Joined",
            message: `Successfully joined room ${roomCode}`,
            duration: 3000,
          })
          hasJoinedRoom.current = true
        }

        if (data.contest?.isActive) {
          setIsContestActive(true)
          // Calculate remaining time
          const elapsed = Math.floor((new Date().getTime() - new Date(data.contest.startTime).getTime()) / 1000)
          setTimeRemaining(Math.max(0, data.contest.duration - elapsed))
        }
      })

      socket.on("contest_started", (contest) => {
        setIsContestActive(true)
        setTimeRemaining(contest.duration)
        addNotification({
          type: "info",
          title: "Contest Started",
          message: "The coding contest has begun!",
          duration: 4000,
        })
      })

      socket.on("user_joined", (data) => {
        setParticipants(data.participantCount)
      })

      socket.on("user_left", (data) => {
        setParticipants(data.participantCount)
      })

      socket.on("submission_completed", (data) => {
        addNotification({
          type: "success",
          title: "Submission Complete",
          message: `Score: ${data.score} points (${data.passedTests}/${data.totalTests} tests passed)`,
          duration: 5000,
        })
        console.log("Submission completed:", data)
      })

      socket.on("leaderboard_updated", (leaderboard) => {
        console.log("Leaderboard updated:", leaderboard)
      })

      socket.on("new_message", (message) => {
        setMessages((prev) => [...prev, message])
      })

    }

    return () => {
      // Clean up socket listeners
      if (socket) {
        socket.off("room_joined")
        socket.off("contest_started")
        socket.off("user_joined")
        socket.off("user_left")
        socket.off("submission_completed")
        socket.off("leaderboard_updated")
        socket.off("new_message")
      }
    }
  }, [user, roomCode, router, addNotification])

  const startContest = () => {
    const contestData = {
      title: `Contest in ${roomCode}`,
      duration: 3600,
      problems: ["two-sum"], // Default problem
    }

    socketService.startContest(contestData)
    setIsContestActive(true)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
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
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-white">CodeClash</h1>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                {roomCode}
              </Badge>
              <ConnectionStatus />
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{participants} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <ContestTimer
                  timeRemaining={timeRemaining}
                  isActive={isContestActive}
                  onTimeUpdate={setTimeRemaining}
                />
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={userProfile?.avatar || "/placeholder.svg"}
                  alt={userProfile?.name || "User"}
                  className="h-6 w-6 rounded-full"
                />
                <span>{userProfile?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!isContestActive ? (
          <Card className="max-w-md mx-auto bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Contest Starting Soon</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-300">Welcome to Room {roomCode}! Click the button below to start the contest.</p>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  {participants} participant{participants !== 1 ? "s" : ""} in this room
                </p>
                <Button onClick={startContest} className="w-full bg-purple-600 hover:bg-purple-700">
                  Start Contest
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
            {/* Problem Statement */}
            <div className="lg:col-span-1">
              <ProblemStatement />
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2">
              <AdvancedCodeEditor roomCode={roomCode} problemId="two-sum" />
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Leaderboard */}
              <div className="h-1/2">
                <Card className="h-full bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>Leaderboard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Leaderboard />
                  </CardContent>
                </Card>
              </div>

              {/* Chat Panel */}
              <div className="h-1/2">
                <Card className="h-full bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <span>Chat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChatPanel roomCode={roomCode} messages={messages} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
    </div>
  )
}
