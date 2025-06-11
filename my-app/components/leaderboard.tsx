"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  timeSpent: number
  testsPassed: number
  totalTests: number
  avatar: string
}

export function Leaderboard({ leaderboard = [] }: { leaderboard?: any[] }) {
  const [entries] = useState<LeaderboardEntry[]>([
    {
      id: "1",
      name: "Alice Chen",
      score: 950,
      timeSpent: 1245,
      testsPassed: 15,
      totalTests: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "2",
      name: "Bob Smith",
      score: 920,
      timeSpent: 1380,
      testsPassed: 14,
      totalTests: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "3",
      name: "Carol Davis",
      score: 890,
      timeSpent: 1520,
      testsPassed: 13,
      totalTests: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "4",
      name: "John Doe",
      score: 750,
      timeSpent: 1800,
      testsPassed: 10,
      totalTests: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "5",
      name: "Eve Wilson",
      score: 680,
      timeSpent: 2100,
      testsPassed: 8,
      totalTests: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-slate-400 font-bold">{rank}</span>
    }
  }

  // Use leaderboard if not empty, else fallback to demo entries
  const data = leaderboard.length > 0 ? leaderboard : entries

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: 0, maxHeight: "320px" }}
      >
        {data.map((entry, idx) => (
          <div
            key={entry.userId || entry.id || idx}
            className="flex items-center space-x-3 px-4 py-2 border-b border-slate-700"
          >
            <div className="w-6 flex justify-center">{getRankIcon(idx + 1)}</div>
            <img
              src={entry.avatar || "/placeholder.svg"}
              alt={entry.name}
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className="text-white font-medium truncate block"
                  title={entry.name}
                  style={{
                    maxWidth: "110px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {entry.name}
                </span>
                <Badge variant="secondary" className="bg-slate-700 text-xs text-slate-300">
                  {entry.testsPassed ?? entry.testsPassed}/{entry.totalTests ?? entry.totalTests}
                </Badge>
              </div>
              <div className="text-xs text-slate-400">
                Time: {formatTime(entry.timeSpent ?? entry.timeSpent)}
              </div>
            </div>
            <span className="text-lg font-bold text-purple-400">{entry.totalScore ?? entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
