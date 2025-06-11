"use client"

import { useState } from "react"
import { socketService } from "@/lib/socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Send, CheckCircle, XCircle } from "lucide-react"

interface CodeEditorProps {
  roomCode?: string
}

export function CodeEditor({ roomCode }: CodeEditorProps) {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(`function twoSum(nums, target) {
    // Your solution here
    
}`)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<
    Array<{ passed: boolean; input: string; expected: string; output: string }>
  >([])

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ]

  const runCode = async () => {
    setIsRunning(true)
    // Simulate API call to Judge0
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTestResults([
      { passed: true, input: "[2,7,11,15], 9", expected: "[0,1]", output: "[0,1]" },
      { passed: true, input: "[3,2,4], 6", expected: "[1,2]", output: "[1,2]" },
      { passed: false, input: "[3,3], 6", expected: "[0,1]", output: "undefined" },
    ])
    setIsRunning(false)
  }

  const submitCode = async () => {
    setIsSubmitting(true)

    try {
      if (roomCode) {
        // Submit via Socket.IO for real-time contests
        socketService.submitCode(code, language, "two-sum")
      } else {
        // Direct API submission for practice
        // await apiService.submitCode({ code, language, problemId: 'two-sum', roomCode: '' })
      }

      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success feedback
      console.log("Code submitted successfully")
    } catch (error) {
      console.error("Submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="h-full bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Code Editor</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-white">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Editor Area */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Write your code here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={runCode}
            disabled={isRunning}
            variant="outline"
            className="flex-1 border-slate-600 text-white hover:bg-slate-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button onClick={submitCode} disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-slate-900 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Test Case {index + 1}</span>
                  <Badge variant={result.passed ? "default" : "destructive"} className="text-xs">
                    {result.passed ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" /> Passed
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" /> Failed
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-300">Input:</span> {result.input}
                  </div>
                  <div>
                    <span className="text-slate-300">Expected:</span> {result.expected}
                  </div>
                  <div>
                    <span className="text-slate-300">Output:</span> {result.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
