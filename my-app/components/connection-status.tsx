"use client"

import { useState, useEffect } from "react"
import { socketService } from "@/lib/socket"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")

  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) return

    const handleConnect = () => setStatus("connected")
    const handleDisconnect = () => setStatus("disconnected")
    const handleConnecting = () => setStatus("connecting")

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("connecting", handleConnecting)

    // Set initial status
    if (socket.connected) {
      setStatus("connected")
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("connecting", handleConnecting)
    }
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: "Connected",
          variant: "default" as const,
          className: "bg-green-600 text-white",
        }
      case "connecting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Connecting",
          variant: "secondary" as const,
          className: "bg-yellow-600 text-white",
        }
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "Disconnected",
          variant: "destructive" as const,
          className: "bg-red-600 text-white",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className={`${config.className} text-xs`}>
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </Badge>
  )
}
