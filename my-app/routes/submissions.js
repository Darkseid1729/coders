import express from "express"
import { authenticateUser } from "../middleware/auth.js"
import { Judge0Service } from "../services/judge0Service.js"
import { db, io } from "../server.js"

const router = express.Router()

// Submit code for execution
router.post("/submit", authenticateUser, async (req, res) => {
  try {
    const { code, language, problemId, roomCode } = req.body
    const userId = req.user.uid

    // Get problem test cases
    const problemDoc = await db.collection("problems").doc(problemId).get()
    if (!problemDoc.exists) {
      return res.status(404).json({ error: "Problem not found" })
    }

    const problem = problemDoc.data()
    const testCases = problem.testCases || []

    // Create submission record
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const submission = {
      id: submissionId,
      userId,
      problemId,
      roomCode,
      code,
      language,
      status: "pending",
      createdAt: new Date(),
      results: [],
    }

    await db.collection("submissions").doc(submissionId).set(submission)

    // Run test cases asynchronously
    processSubmission(submissionId, code, language, testCases, userId, roomCode, problem)

    res.json({ submissionId, status: "pending" })
  } catch (error) {
    console.error("Submission error:", error)
    res.status(500).json({ error: "Failed to submit code" })
  }
})

// Get submission result
router.get("/result/:submissionId", authenticateUser, async (req, res) => {
  try {
    const { submissionId } = req.params

    const submissionDoc = await db.collection("submissions").doc(submissionId).get()
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: "Submission not found" })
    }

    const submission = submissionDoc.data()

    // Check if user owns this submission or is in the same room
    if (submission.userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" })
    }

    res.json(submission)
  } catch (error) {
    console.error("Get submission error:", error)
    res.status(500).json({ error: "Failed to get submission" })
  }
})

// Get user's submissions for a problem
router.get("/user/:problemId", authenticateUser, async (req, res) => {
  try {
    const { problemId } = req.params
    const userId = req.user.uid

    const submissionsSnapshot = await db
      .collection("submissions")
      .where("userId", "==", userId)
      .where("problemId", "==", problemId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get()

    const submissions = submissionsSnapshot.docs.map((doc) => doc.data())
    res.json(submissions)
  } catch (error) {
    console.error("Get user submissions error:", error)
    res.status(500).json({ error: "Failed to get submissions" })
  }
})

// Process submission asynchronously
async function processSubmission(submissionId, code, language, testCases, userId, roomCode, problem) {
  try {
    console.log(`Processing submission ${submissionId}...`)

    // Update status to running
    await db.collection("submissions").doc(submissionId).update({
      status: "running",
      updatedAt: new Date(),
    })

    // Run test cases
    const results = await Judge0Service.runTestCases(code, language, testCases)

    // Calculate score
    const passedTests = results.filter((r) => r.passed).length
    const totalTests = results.length
    const accuracy = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

    // Calculate time bonus (assuming contest started time is available)
    const timeBonus = calculateTimeBonus(userId, roomCode)
    const finalScore = Math.round((accuracy * problem.maxScore) / 100 + timeBonus)

    // Update submission with results
    const submissionUpdate = {
      status: "completed",
      results,
      score: finalScore,
      passedTests,
      totalTests,
      accuracy,
      completedAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("submissions").doc(submissionId).update(submissionUpdate)

    // Update user's best score for this problem
    await updateUserScore(userId, problem.id, finalScore, roomCode)

    // Emit real-time updates
    if (roomCode) {
      io.to(roomCode).emit("submission_completed", {
        submissionId,
        userId,
        score: finalScore,
        passedTests,
        totalTests,
        accuracy,
      })

      // Update leaderboard
      await updateLeaderboard(roomCode)
    }

    console.log(`Submission ${submissionId} completed with score: ${finalScore}`)
  } catch (error) {
    console.error(`Error processing submission ${submissionId}:`, error)

    // Update submission with error
    await db.collection("submissions").doc(submissionId).update({
      status: "error",
      error: error.message,
      updatedAt: new Date(),
    })

    if (roomCode) {
      io.to(roomCode).emit("submission_error", {
        submissionId,
        userId,
        error: error.message,
      })
    }
  }
}

// Calculate time bonus based on submission time
function calculateTimeBonus(userId, roomCode) {
  // This is a simplified time bonus calculation
  // In a real implementation, you'd track when the contest started
  // and calculate bonus based on how quickly the user submitted
  return Math.floor(Math.random() * 50) // Random bonus for demo
}

// Update user's score in the contest
async function updateUserScore(userId, problemId, score, roomCode) {
  try {
    const userScoreRef = db.collection("rooms").doc(roomCode).collection("scores").doc(userId)

    const userScoreDoc = await userScoreRef.get()

    if (!userScoreDoc.exists) {
      await userScoreRef.set({
        userId,
        problemScores: { [problemId]: score },
        totalScore: score,
        lastSubmission: new Date(),
      })
    } else {
      const currentData = userScoreDoc.data()
      const currentProblemScore = currentData.problemScores[problemId] || 0

      // Only update if new score is better
      if (score > currentProblemScore) {
        const scoreDiff = score - currentProblemScore
        await userScoreRef.update({
          [`problemScores.${problemId}`]: score,
          totalScore: (currentData.totalScore || 0) + scoreDiff,
          lastSubmission: new Date(),
        })
      }
    }
  } catch (error) {
    console.error("Error updating user score:", error)
  }
}

// Update leaderboard for the room
async function updateLeaderboard(roomCode) {
  try {
    const scoresSnapshot = await db
      .collection("rooms")
      .doc(roomCode)
      .collection("scores")
      .orderBy("totalScore", "desc")
      .orderBy("lastSubmission", "asc")
      .limit(50)
      .get()

    const leaderboard = []

    for (const doc of scoresSnapshot.docs) {
      const scoreData = doc.data()

      // Get user info
      const userDoc = await db.collection("users").doc(scoreData.userId).get()
      const userData = userDoc.exists ? userDoc.data() : { name: "Unknown User" }

      leaderboard.push({
        userId: scoreData.userId,
        name: userData.name,
        avatar: userData.avatar,
        totalScore: scoreData.totalScore,
        problemScores: scoreData.problemScores,
        lastSubmission: scoreData.lastSubmission,
      })
    }

    // Emit updated leaderboard
    io.to(roomCode).emit("leaderboard_updated", leaderboard)

    return leaderboard
  } catch (error) {
    console.error("Error updating leaderboard:", error)
  }
}

export default router
