"use client"

import { useEffect } from "react"

interface ContestTimerProps {
  timeRemaining: number
  isActive: boolean
  onTimeUpdate: (time: number) => void
}

export function ContestTimer({ timeRemaining, isActive, onTimeUpdate }: ContestTimerProps) {
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return

    const timer = setInterval(() => {
      onTimeUpdate(timeRemaining - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isActive, onTimeUpdate])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 300) return "text-red-400" // Last 5 minutes
    if (timeRemaining <= 900) return "text-yellow-400" // Last 15 minutes
    return "text-green-400"
  }

  return <span className={`font-mono font-bold ${getTimeColor()}`}>{formatTime(timeRemaining)}</span>
}
