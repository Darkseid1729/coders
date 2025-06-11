"use client"

import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { initFirebase } from "../firebaseClient";
import { socketService } from "@/lib/socket"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
  avatar: string
}

export interface ChatPanelProps {
  roomCode: string
  messages: ChatMessage[]
}

export function ChatPanel({ roomCode, messages }: ChatPanelProps) {
  const { userProfile } = useAuth() as { userProfile: any }
  const [token, setToken] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isReady, setIsReady] = useState(false)
  const [imgErrorMap, setImgErrorMap] = useState<{ [id: string]: boolean }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get Firebase token
  useEffect(() => {
    initFirebase();
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then(token => {
        setToken(token);
        console.log("Got Firebase token:", token.substring(0, 10) + "...");
      });
    } else {
      console.log("No Firebase user found in getAuth().currentUser");
    }
  }, [userProfile])

  // Connect and authenticate/join room on mount if roomCode is present
  useEffect(() => {
    if (!roomCode || !token) {
      console.log("Waiting for roomCode or token...", { roomCode, token });
      return
    }

    // Only connect if not already connected
    if (!socketService.isSocketConnected()) {
      socketService.connect()
    }

    setIsReady(false)
    // Authenticate every time we have a new token
    socketService.emit("authenticate", token)

    // Handler for authenticated event
    const handleAuthenticated = () => {
      console.log("Socket authenticated, joining room:", roomCode)
      socketService.joinRoom(roomCode)
    }
    // Handler for room joined event
    const handleRoomJoined = (data: any) => {
      console.log("Joined room:", roomCode, data)
      setIsReady(true)
    }

    socketService.on("authenticated", handleAuthenticated)
    socketService.on("room_joined", handleRoomJoined)

    // Debug: log socket connection status
    const socket = socketService.getSocket()
    if (socket) {
      socket.on("connect", () => console.log("Socket connected"))
      socket.on("disconnect", () => console.log("Socket disconnected"))
    }

    // Fallback: if not ready after 5 seconds, enable input for debugging
    const fallbackTimeout = setTimeout(() => {
      if (!isReady) {
        console.warn("Fallback: Forcing chat input enabled after timeout");
        setIsReady(true)
      }
    }, 5000)

    return () => {
      socketService.off("authenticated", handleAuthenticated)
      socketService.off("room_joined", handleRoomJoined)
      if (socket) {
        socket.off("connect")
        socket.off("disconnect")
      }
      clearTimeout(fallbackTimeout)
    }
  }, [roomCode, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!isReady) return // Prevent sending if not authenticated and joined
    if (newMessage.trim()) {
      if (roomCode) {
        // Send via Socket.IO for real-time chat
        socketService.sendMessage(newMessage)
        // Do not add message locally, wait for server echo...
      }
      setNewMessage("")
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message) => {
          const initials = message.user
            ? message.user.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
            : "U"
          const imgError = imgErrorMap[message.id]
          return (
            <div key={message.id} className="flex space-x-2">
              {(!imgError && message.avatar) ? (
                <img
                  src={message.avatar}
                  alt={message.user}
                  className="h-6 w-6 rounded-full flex-shrink-0 mt-1 bg-slate-700"
                  onError={() =>
                    setImgErrorMap((prev) => ({ ...prev, [message.id]: true }))
                  }
                />
              ) : (
                <div
                  className="h-6 w-6 rounded-full flex-shrink-0 mt-1 bg-purple-700 flex items-center justify-center text-xs font-bold text-white"
                  title={message.user}
                >
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">{message.user}</span>
                  <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-300 break-words">{message.message}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="mt-auto w-full p-4 border-t border-slate-600 bg-slate-800">
        <form
          className="flex space-x-2"
          style={{ marginBottom: 0 }}
          onSubmit={e => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={isReady ? "Type a message..." : "Connecting..."}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            style={{ minHeight: "2.5rem" }}
            disabled={!isReady}
          />
          <Button
            onClick={sendMessage}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            type="submit"
            style={{ minHeight: "2.5rem" }}
            disabled={!isReady}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
