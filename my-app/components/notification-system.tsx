"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
  persistent?: boolean
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRemove={onRemove} />
      ))}
    </div>
  )
}

function NotificationItem({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    if (notification.duration && !notification.persistent) {
      const timer = setTimeout(() => {
        handleRemove()
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, notification.persistent])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Wait for fade animation
  }

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-green-500"
      case "error":
        return "border-red-500"
      case "warning":
        return "border-yellow-500"
      default:
        return "border-blue-500"
    }
  }

  return (
    <div
      className={`bg-slate-800 border-l-4 ${getBorderColor()} border-slate-700 rounded-lg p-4 shadow-lg max-w-sm transition-all duration-300 ${
        isRemoving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      } ${isVisible ? "animate-in slide-in-from-right" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium">{notification.title}</h4>
          <p className="text-slate-300 text-sm">{notification.message}</p>
        </div>
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check if similar notification already exists to prevent duplicates
    const existingNotification = notifications.find(
      (n) => n.title === notification.title && n.message === notification.message,
    )

    if (existingNotification) {
      return // Don't add duplicate notifications
    }

    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        id,
        duration: notification.duration || 4000, // Default 4 seconds
      },
    ])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }
}
