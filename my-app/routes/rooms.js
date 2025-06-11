import express from "express"
import { authenticateUser } from "../middleware/auth.js"
import { db } from "../server.js"

const router = express.Router()

// Create a new room
router.post("/create", authenticateUser, async (req, res) => {
  try {
    const { name, description, isPrivate = false } = req.body
    const userId = req.user.uid

    const roomCode = generateRoomCode()

    const room = {
      code: roomCode,
      name: name || `Room ${roomCode}`,
      description: description || "",
      createdBy: userId,
      createdAt: new Date(),
      isPrivate,
      isActive: true,
      participants: [userId],
      maxParticipants: 50,
    }

    await db.collection("rooms").doc(roomCode).set(room)

    res.json({ room })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({ error: "Failed to create room" })
  }
})

// Join a room
router.post("/join/:roomCode", authenticateUser, async (req, res) => {
  try {
    const { roomCode } = req.params
    const userId = req.user.uid

    const roomRef = db.collection("rooms").doc(roomCode)
    const roomDoc = await roomRef.get()

    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" })
    }

    const room = roomDoc.data()

    if (!room.isActive) {
      return res.status(400).json({ error: "Room is not active" })
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ error: "Room is full" })
    }

    if (!room.participants.includes(userId)) {
      await roomRef.update({
        participants: [...room.participants, userId],
        lastActivity: new Date(),
      })
    }

    res.json({ message: "Joined room successfully", roomCode })
  } catch (error) {
    console.error("Join room error:", error)
    res.status(500).json({ error: "Failed to join room" })
  }
})

// Get room details
router.get("/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params

    const roomDoc = await db.collection("rooms").doc(roomCode).get()
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" })
    }

    const room = roomDoc.data()

    // Get participant details
    const participantDetails = await Promise.all(
      room.participants.map(async (userId) => {
        const userDoc = await db.collection("users").doc(userId).get()
        return userDoc.exists ? { id: userId, ...userDoc.data() } : { id: userId, name: "Unknown User" }
      }),
    )

    room.participantDetails = participantDetails

    res.json({ room })
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ error: "Failed to get room" })
  }
})

// Get room messages
router.get("/:roomCode/messages", authenticateUser, async (req, res) => {
  try {
    const { roomCode } = req.params
    const { limit = 50, before } = req.query

    let query = db
      .collection("rooms")
      .doc(roomCode)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(Number.parseInt(limit))

    if (before) {
      query = query.startAfter(new Date(before))
    }

    const messagesSnapshot = await query.get()
    const messages = messagesSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .reverse() // Reverse to get chronological order

    res.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ error: "Failed to get messages" })
  }
})

// Leave room
router.post("/leave/:roomCode", authenticateUser, async (req, res) => {
  try {
    const { roomCode } = req.params
    const userId = req.user.uid

    const roomRef = db.collection("rooms").doc(roomCode)
    const roomDoc = await roomRef.get()

    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" })
    }

    const room = roomDoc.data()
    const updatedParticipants = room.participants.filter((id) => id !== userId)

    await roomRef.update({
      participants: updatedParticipants,
      lastActivity: new Date(),
    })

    res.json({ message: "Left room successfully" })
  } catch (error) {
    console.error("Leave room error:", error)
    res.status(500).json({ error: "Failed to leave room" })
  }
})

// List public rooms
router.get("/", async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const roomsSnapshot = await db
      .collection("rooms")
      .where("isPrivate", "==", false)
      .where("isActive", "==", true)
      .orderBy("lastActivity", "desc")
      .limit(Number.parseInt(limit))
      .get()

    const rooms = roomsSnapshot.docs.map((doc) => ({
      code: doc.id,
      ...doc.data(),
      participantCount: doc.data().participants?.length || 0,
    }))

    res.json({ rooms })
  } catch (error) {
    console.error("List rooms error:", error)
    res.status(500).json({ error: "Failed to list rooms" })
  }
})

function generateRoomCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

export default router
