"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Target } from "lucide-react"

export function ProblemStatement() {
  return (
    <Card className="h-full bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Two Sum</CardTitle>
          <Badge className="bg-green-600 text-white">Easy</Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>100 points</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>30 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>12 solved</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto">
        <div>
          <h4 className="text-white font-medium mb-2">Problem Description</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            Given an array of integers <code className="bg-slate-700 px-1 rounded">nums</code> and an integer{" "}
            <code className="bg-slate-700 px-1 rounded">target</code>, return indices of the two numbers such that they
            add up to target.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mt-2">
            You may assume that each input would have exactly one solution, and you may not use the same element twice.
          </p>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Example 1</h4>
          <div className="bg-slate-900 p-3 rounded-lg text-sm">
            <div className="text-slate-300">
              <div>
                <span className="text-blue-400">Input:</span> nums = [2,7,11,15], target = 9
              </div>
              <div>
                <span className="text-green-400">Output:</span> [0,1]
              </div>
              <div>
                <span className="text-yellow-400">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Example 2</h4>
          <div className="bg-slate-900 p-3 rounded-lg text-sm">
            <div className="text-slate-300">
              <div>
                <span className="text-blue-400">Input:</span> nums = [3,2,4], target = 6
              </div>
              <div>
                <span className="text-green-400">Output:</span> [1,2]
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Constraints</h4>
          <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
            <li>2 ≤ nums.length ≤ 10⁴</li>
            <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
            <li>-10⁹ ≤ target ≤ 10⁹</li>
            <li>Only one valid answer exists</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Scoring</h4>
          <div className="text-slate-300 text-sm space-y-1">
            <div>
              • <span className="text-green-400">100 points</span> for passing all test cases
            </div>
            <div>
              • <span className="text-blue-400">Time bonus</span> for faster submissions
            </div>
            <div>
              • <span className="text-purple-400">Efficiency bonus</span> for optimal solutions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
