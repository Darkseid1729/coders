import express from "express"
import { authenticateUser } from "../middleware/auth.js"
import { db } from "../server.js"

const router = express.Router()

// Create a new contest
router.post("/create", authenticateUser, async (req, res) => {
  try {
    const { title, description, duration, problems, roomCode } = req.body
    const userId = req.user.uid

    const contest = {
      id: roomCode || generateRoomCode(),
      title,
      description,
      duration: duration || 3600, // Default 1 hour
      problems: problems || [],
      createdBy: userId,
      createdAt: new Date(),
      isActive: false,
      participants: [],
    }

    await db.collection("contests").doc(contest.id).set(contest)

    res.json({ contest })
  } catch (error) {
    console.error("Create contest error:", error)
    res.status(500).json({ error: "Failed to create contest" })
  }
})

// Get contest details
router.get("/:contestId", async (req, res) => {
  try {
    const { contestId } = req.params

    const contestDoc = await db.collection("contests").doc(contestId).get()
    if (!contestDoc.exists) {
      return res.status(404).json({ error: "Contest not found" })
    }

    const contest = contestDoc.data()

    // Get problems details
    const problemsWithDetails = await Promise.all(
      contest.problems.map(async (problemId) => {
        const problemDoc = await db.collection("problems").doc(problemId).get()
        return problemDoc.exists ? { id: problemId, ...problemDoc.data() } : null
      }),
    )

    contest.problems = problemsWithDetails.filter((p) => p !== null)

    res.json({ contest })
  } catch (error) {
    console.error("Get contest error:", error)
    res.status(500).json({ error: "Failed to get contest" })
  }
})

// Get contest leaderboard
router.get("/:contestId/leaderboard", async (req, res) => {
  try {
    const { contestId } = req.params

    const scoresSnapshot = await db
      .collection("rooms")
      .doc(contestId)
      .collection("scores")
      .orderBy("totalScore", "desc")
      .orderBy("lastSubmission", "asc")
      .get()

    const leaderboard = []

    for (const doc of scoresSnapshot.docs) {
      const scoreData = doc.data()

      // Get user info
      const userDoc = await db.collection("users").doc(scoreData.userId).get()
      const userData = userDoc.exists ? userDoc.data() : { name: "Unknown User" }

      leaderboard.push({
        rank: leaderboard.length + 1,
        userId: scoreData.userId,
        name: userData.name,
        avatar: userData.avatar,
        totalScore: scoreData.totalScore,
        problemScores: scoreData.problemScores,
        lastSubmission: scoreData.lastSubmission,
      })
    }

    res.json({ leaderboard })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({ error: "Failed to get leaderboard" })
  }
})

// Add default problems for demo
router.post("/seed-problems", authenticateUser, async (req, res) => {
  try {
    const problems = [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
        ],
        constraints: [
          "2 ≤ nums.length ≤ 10⁴",
          "-10⁹ ≤ nums[i] ≤ 10⁹",
          "-10⁹ ≤ target ≤ 10⁹",
          "Only one valid answer exists.",
        ],
        testCases: [
          { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
          { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
          { input: "[3,3]\n6", expectedOutput: "[0,1]" },
        ],
        maxScore: 100,
        timeLimit: 1800, // 30 minutes
      },
      {
        id: "reverse-string",
        title: "Reverse String",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters s.",
        examples: [
          {
            input: 's = ["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]',
          },
        ],
        constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character."],
        testCases: [
          { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
          { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
        ],
        maxScore: 80,
        timeLimit: 1200, // 20 minutes
      },
    ]

    for (const problem of problems) {
      await db.collection("problems").doc(problem.id).set(problem)
    }

    res.json({ message: "Problems seeded successfully", count: problems.length })
  } catch (error) {
    console.error("Seed problems error:", error)
    res.status(500).json({ error: "Failed to seed problems" })
  }
})

function generateRoomCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

export default router
