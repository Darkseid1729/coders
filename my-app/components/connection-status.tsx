"use client"

import { useState, useEffect } from "react"
import { socketService } from "@/lib/socket"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")

  useEffect(() => {
    // Remove usage of getSocket, use socketService events directly
    const handleOpen = () => setStatus("connected")
    const handleClose = () => setStatus("disconnected")
    const handleConnecting = () => setStatus("connecting")

    socketService.on("open", handleOpen)
    socketService.on("close", handleClose)
    // Optionally, you can set status to "connecting" when connect() is called
    // or listen to a custom "connecting" event if you emit it

    // Set initial status
    if (socketService.isSocketConnected()) {
      setStatus("connected")
    }

    return () => {
      socketService.off("open", handleOpen)
      socketService.off("close", handleClose)
      // socketService.off("connecting", handleConnecting)
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
