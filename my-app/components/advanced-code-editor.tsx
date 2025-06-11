"use client"

import { useState, useRef, useEffect } from "react"
import { socketService } from "@/lib/socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Play, Send, CheckCircle, XCircle, Copy, Download, Settings, Terminal } from "lucide-react"

interface AdvancedCodeEditorProps {
  roomCode?: string
  problemId?: string
}

export function AdvancedCodeEditor({ roomCode, problemId = "two-sum" }: AdvancedCodeEditorProps) {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(getDefaultCode("javascript"))
  const [customInput, setCustomInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([])
  const [fontSize, setFontSize] = useState(14)
  const [activeTab, setActiveTab] = useState("editor")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const languages = [
    { value: "javascript", label: "JavaScript", extension: "js" },
    { value: "python", label: "Python", extension: "py" },
    { value: "java", label: "Java", extension: "java" },
    { value: "cpp", label: "C++", extension: "cpp" },
    { value: "c", label: "C", extension: "c" },
    { value: "go", label: "Go", extension: "go" },
    { value: "rust", label: "Rust", extension: "rs" },
  ]

  useEffect(() => {
    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`code_${problemId}_${language}`)
    if (savedCode) {
      setCode(savedCode)
    } else {
      setCode(getDefaultCode(language))
    }
  }, [language, problemId])

  useEffect(() => {
    // Save code to localStorage
    localStorage.setItem(`code_${problemId}_${language}`, code)
  }, [code, language, problemId])

  useEffect(() => {
    // Set up socket listeners for submission results
    const handleSubmissionCompleted = (data: any) => {
      setTestResults(data.results || [])
      setSubmissionHistory((prev) => [data, ...prev.slice(0, 9)])
      setIsSubmitting(false)
      setActiveTab("results")
    }

    const handleSubmissionError = (data: any) => {
      console.error("Submission error:", data.error)
      setOutput(`Error: ${data.error}`)
      setIsSubmitting(false)
      setActiveTab("console")
    }

    socketService.on("submission_completed", handleSubmissionCompleted)
    socketService.on("submission_error", handleSubmissionError)

    return () => {
      socketService.off("submission_completed", handleSubmissionCompleted)
      socketService.off("submission_error", handleSubmissionError)
    }
  }, [])

  const runCodeWithCustomInput = async () => {
    setIsRunning(true)
    setOutput("")
    setActiveTab("console")

    try {
      // Simulate running code with custom input
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock execution result based on language and input
      let result = ""
      if (customInput.trim()) {
        result = `Input: ${customInput}\n`

        // Simulate different outputs based on language
        switch (language) {
          case "javascript":
            result += `Output: [0, 1]\nExecution time: 1ms\nMemory usage: 42MB`
            break
          case "python":
            result += `Output: [0, 1]\nExecution time: 2ms\nMemory usage: 38MB`
            break
          case "java":
            result += `Output: [0, 1]\nExecution time: 5ms\nMemory usage: 55MB`
            break
          default:
            result += `Output: [0, 1]\nExecution time: 1ms\nMemory usage: 40MB`
        }
      } else {
        result = "No input provided. Please enter test input in the Input section."
      }

      setOutput(result)
    } catch (error) {
      setOutput(`Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const runTestCases = async () => {
    setIsRunning(true)
    setActiveTab("results")

    try {
      // Simulate running predefined test cases
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setTestResults([
        {
          passed: true,
          input: "[2,7,11,15], 9",
          expected: "[0,1]",
          output: "[0,1]",
          time: "1ms",
          memory: "42MB",
        },
        {
          passed: true,
          input: "[3,2,4], 6",
          expected: "[1,2]",
          output: "[1,2]",
          time: "1ms",
          memory: "42MB",
        },
        {
          passed: Math.random() > 0.3,
          input: "[3,3], 6",
          expected: "[0,1]",
          output: Math.random() > 0.3 ? "[0,1]" : "undefined",
          time: "1ms",
          memory: "42MB",
        },
      ])
    } catch (error) {
      console.error("Test run error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const submitCode = async () => {
    setIsSubmitting(true)
    try {
      if (roomCode) {
        socketService.submitCode({ code, language, problemId })
      } else {
        // Handle practice mode submission
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Submission failed:", error)
      setIsSubmitting(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const downloadCode = () => {
    const currentLang = languages.find((l) => l.value === language)
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `solution.${currentLang?.extension || "txt"}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetCode = () => {
    setCode(getDefaultCode(language))
  }

  const clearOutput = () => {
    setOutput("")
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
            <Button
              onClick={copyCode}
              variant="outline"
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={downloadCode}
              variant="outline"
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="editor" className="text-white data-[state=active]:bg-slate-600">
              Editor
            </TabsTrigger>
            <TabsTrigger value="console" className="text-white data-[state=active]:bg-slate-600">
              Console
            </TabsTrigger>
            <TabsTrigger value="results" className="text-white data-[state=active]:bg-slate-600">
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-slate-600">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            {/* Editor Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Font Size:</span>
                <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
                  <SelectTrigger className="w-20 h-8 bg-slate-700 border-slate-600 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[12, 14, 16, 18, 20].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-white text-xs">
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={resetCode}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Reset
              </Button>
            </div>

            {/* Code Editor */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
                placeholder="Write your code here..."
                spellCheck={false}
              />
              <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                Lines: {code.split("\n").length} | Chars: {code.length}
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-2">
              <Label className="text-white">Custom Input (Optional)</Label>
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full h-20 p-3 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter test input here (e.g., [2,7,11,15] and 9 on separate lines)"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={runCodeWithCustomInput}
                disabled={isRunning}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Terminal className="h-4 w-4 mr-2" />
                {isRunning ? "Running..." : "Run"}
              </Button>
              <Button
                onClick={runTestCases}
                disabled={isRunning}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button onClick={submitCode} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="console" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                Console Output
              </h4>
              <Button
                onClick={clearOutput}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Clear
              </Button>
            </div>
            <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 h-80 overflow-y-auto">
              {output ? (
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">{output}</pre>
              ) : (
                <p className="text-slate-500 text-sm">No output yet. Run your code to see results here.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {testResults.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Test Results:</h4>
                {testResults.map((result, index) => (
                  <div key={index} className="p-4 bg-slate-900 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-300">Test Case {index + 1}</span>
                      <div className="flex items-center space-x-2">
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
                        {result.time && (
                          <Badge variant="secondary" className="text-xs bg-slate-600 text-white">
                            {result.time}
                          </Badge>
                        )}
                        {result.memory && (
                          <Badge variant="secondary" className="text-xs bg-slate-600 text-white">
                            {result.memory}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-slate-300 font-medium">Input:</span>
                          <pre className="mt-1 p-2 bg-slate-800 rounded text-slate-300">{result.input}</pre>
                        </div>
                        <div>
                          <span className="text-slate-300 font-medium">Expected:</span>
                          <pre className="mt-1 p-2 bg-slate-800 rounded text-green-300">{result.expected}</pre>
                        </div>
                        <div>
                          <span className="text-slate-300 font-medium">Output:</span>
                          <pre
                            className={`mt-1 p-2 bg-slate-800 rounded ${
                              result.passed ? "text-green-300" : "text-red-300"
                            }`}
                          >
                            {result.output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No test results yet. Run test cases to see results.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {submissionHistory.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Submission History:</h4>
                {submissionHistory.map((submission, index) => (
                  <div key={index} className="p-3 bg-slate-900 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">Submission #{submissionHistory.length - index}</div>
                        <div className="text-xs text-slate-400">{new Date(submission.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={submission.accuracy === 100 ? "default" : "secondary"}
                          className={
                            submission.accuracy === 100 ? "bg-green-600 text-white" : "bg-slate-600 text-white"
                          }
                        >
                          {submission.passedTests}/{submission.totalTests} passed
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-600 text-white">
                          {submission.score} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No submissions yet. Submit your code to see history.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function getDefaultCode(language: string): string {
  const templates = {
    javascript: `function twoSum(nums, target) {
    // Your solution here
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}

// Test with custom input
// Example: nums = [2,7,11,15], target = 9
console.log(twoSum([2,7,11,15], 9));`,
    python: `def two_sum(nums, target):
    # Your solution here
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []

# Test with custom input
# Example: nums = [2,7,11,15], target = 9
print(two_sum([2,7,11,15], 9))`,
    java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
    
    // Test with custom input
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.twoSum(new int[]{2,7,11,15}, 9);
        System.out.println(Arrays.toString(result));
    }
}`,
    cpp: `#include <vector>
#include <unordered_map>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        
        return {};
    }
};

// Test with custom input
int main() {
    Solution sol;
    vector<int> nums = {2,7,11,15};
    vector<int> result = sol.twoSum(nums, 9);
    
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your solution here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    
    *returnSize = 0;
    return result;
}

// Test with custom input
int main() {
    int nums[] = {2,7,11,15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    
    printf("[%d,%d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`,
    go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    // Your solution here
    numMap := make(map[int]int)
    
    for i, num := range nums {
        complement := target - num
        if j, exists := numMap[complement]; exists {
            return []int{j, i}
        }
        numMap[num] = i
    }
    
    return []int{}
}

// Test with custom input
func main() {
    result := twoSum([]int{2,7,11,15}, 9)
    fmt.Println(result)
}`,
    rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Your solution here
        use std::collections::HashMap;
        let mut map = HashMap::new();
        
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            if let Some(&j) = map.get(&complement) {
                return vec![j as i32, i as i32];
            }
            map.insert(num, i);
        }
        
        vec![]
    }
}

// Test with custom input
fn main() {
    let result = Solution::two_sum(vec![2,7,11,15], 9);
    println!("{:?}", result);
}`,
  }

  return templates[language as keyof typeof templates] || templates.javascript
}
