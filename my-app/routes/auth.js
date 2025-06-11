import express from "express"
import { authenticateUser } from "../middleware/auth.js"
import { db } from "../server.js"

const router = express.Router()

// Verify token and get/create user profile
router.post("/verify", authenticateUser, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user

    // Check if user exists in database
    const userRef = db.collection("users").doc(uid)
    const userDoc = await userRef.get()

    let userData

    if (!userDoc.exists) {
      // Create new user profile
      userData = {
        uid,
        email,
        name: name || email.split("@")[0],
        avatar: picture || null,
        createdAt: new Date(),
        lastLogin: new Date(),
        totalScore: 0,
        contestsParticipated: 0,
        problemsSolved: 0,
      }

      await userRef.set(userData)
    } else {
      // Update last login
      userData = userDoc.data()
      await userRef.update({ lastLogin: new Date() })
    }

    res.json({ user: userData })
  } catch (error) {
    console.error("Auth verify error:", error)
    res.status(500).json({ error: "Failed to verify user" })
  }
})

// Get user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user

    const userDoc = await db.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" })
    }

    const userData = userDoc.data()
    res.json({ user: userData })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
})

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user
    const { name, avatar } = req.body

    const updateData = {
      updatedAt: new Date(),
    }

    if (name) updateData.name = name
    if (avatar) updateData.avatar = avatar

    await db.collection("users").doc(uid).update(updateData)

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Get user statistics
router.get("/stats", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user

    // Get user's submissions
    const submissionsSnapshot = await db.collection("submissions").where("userId", "==", uid).get()

    const submissions = submissionsSnapshot.docs.map((doc) => doc.data())

    // Calculate statistics
    const totalSubmissions = submissions.length
    const acceptedSubmissions = submissions.filter((s) => s.status === "completed" && s.accuracy === 100).length
    const averageScore =
      submissions.length > 0 ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length : 0

    // Get unique problems solved
    const problemsSolved = new Set(
      submissions.filter((s) => s.status === "completed" && s.accuracy === 100).map((s) => s.problemId),
    ).size

    // Get contests participated
    const contestsSnapshot = await db.collection("rooms").where("participants", "array-contains", uid).get()

    const stats = {
      totalSubmissions,
      acceptedSubmissions,
      problemsSolved,
      contestsParticipated: contestsSnapshot.size,
      averageScore: Math.round(averageScore),
      acceptanceRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to get statistics" })
  }
})

export default router
