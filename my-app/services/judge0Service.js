import fetch from "node-fetch"

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com"
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY

// Language ID mappings for Judge0
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
  c: 50, // C
  csharp: 51, // C#
  go: 60, // Go
  rust: 73, // Rust
  kotlin: 78, // Kotlin
  swift: 83, // Swift
}

export class Judge0Service {
  static async submitCode(code, language, input = "", expectedOutput = "") {
    try {
      const languageId = LANGUAGE_IDS[language.toLowerCase()]

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`)
      }

      // Submit code for execution
      const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: input,
          expected_output: expectedOutput,
        }),
      })

      if (!submissionResponse.ok) {
        throw new Error(`Judge0 API error: ${submissionResponse.status}`)
      }

      const submission = await submissionResponse.json()
      const token = submission.token

      // Poll for results
      return await this.getSubmissionResult(token)
    } catch (error) {
      console.error("Judge0 submission error:", error)
      throw error
    }
  }

  static async getSubmissionResult(token, maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, {
          headers: {
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        })

        if (!response.ok) {
          throw new Error(`Judge0 API error: ${response.status}`)
        }

        const result = await response.json()

        // Check if execution is complete
        if (result.status.id <= 2) {
          // In Queue or Processing
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
          continue
        }

        return this.formatResult(result)
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error)
        if (attempt === maxAttempts - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    throw new Error("Timeout waiting for execution result")
  }

  static formatResult(result) {
    return {
      status: result.status.description,
      statusId: result.status.id,
      output: result.stdout || "",
      error: result.stderr || result.compile_output || "",
      time: result.time || "0",
      memory: result.memory || 0,
      passed: result.status.id === 3, // Accepted
      exitCode: result.exit_code,
    }
  }

  static async runTestCases(code, language, testCases) {
    const results = []

    for (const testCase of testCases) {
      try {
        const result = await this.submitCode(code, language, testCase.input, testCase.expectedOutput)

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output.trim(),
          passed: result.passed && result.output.trim() === testCase.expectedOutput.trim(),
          time: result.time,
          memory: result.memory,
          error: result.error,
        })
      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          passed: false,
          time: "0",
          memory: 0,
          error: error.message,
        })
      }
    }

    return results
  }
}
