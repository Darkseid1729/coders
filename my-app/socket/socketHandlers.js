import { db } from "../server.js"
import { verifyFirebaseToken } from "../middleware/auth.js"

const activeRooms = new Map() // Store active room data
const userSockets = new Map() // Map user IDs to socket IDs

export function handleConnection(socket, io) {
  let currentUser = null
  let currentRoom = null

  // Authentication
  socket.on("authenticate", async (token) => {
    console.log("Received authenticate event with token:", token)
    try {
      const decodedToken = await verifyFirebaseToken(token)
      currentUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        avatar: decodedToken.picture || null,
      }

      userSockets.set(currentUser.uid, socket.id)
      socket.emit("authenticated", { user: currentUser })
      console.log(`User authenticated: ${currentUser.name}`)
    } catch (error) {
      socket.emit("auth_error", { message: "Authentication failed" })
    }
  })

  // Join contest room
  socket.on("join_room", async (roomCode) => {
    // Support both string and object for roomCode
    const code = typeof roomCode === "string" ? roomCode : roomCode?.roomCode
    console.log("Received join_room event:", code, "currentUser:", currentUser)
    if (!currentUser) {
      socket.emit("error", { message: "Not authenticated" })
      return
    }

    try {
      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom)
        await updateRoomParticipants(currentRoom, currentUser.uid, "leave")
      }

      // Join new room
      socket.join(code)
      currentRoom = code

      // Initialize room if it doesn't exist
      if (!activeRooms.has(code)) {
        activeRooms.set(code, {
          code,
          participants: new Map(),
          contest: null,
          leaderboard: [],
          messages: [],
        })
      }

      // Add user to room
      const room = activeRooms.get(code)
      room.participants.set(currentUser.uid, {
        ...currentUser,
        socketId: socket.id,
        joinedAt: new Date(),
        score: 0,
        submissions: 0,
        timeSpent: 0,
      })

      // Update database
      await updateRoomParticipants(code, currentUser.uid, "join")

      // Notify room about new participant
      socket.to(code).emit("user_joined", {
        user: currentUser,
        participantCount: room.participants.size,
      })

      // Send room data to user
      socket.emit("room_joined", {
        roomCode: code,
        participants: Array.from(room.participants.values()),
        contest: room.contest,
        leaderboard: room.leaderboard,
        messages: room.messages.slice(-50), // Last 50 messages
      })

      console.log(`User ${currentUser.name} joined room ${code}`)
    } catch (error) {
      socket.emit("error", { message: "Failed to join room" })
    }
  })

  // Start contest
  socket.on("start_contest", async (contestData) => {
    if (!currentUser || !currentRoom) return

    try {
      const room = activeRooms.get(currentRoom)
      if (!room) return

      // Set contest data
      room.contest = {
        ...contestData,
        startTime: new Date(),
        duration: contestData.duration || 3600, // 1 hour default
        isActive: true,
      }

      // Save to database
      await db
        .collection("contests")
        .doc(currentRoom)
        .set({
          ...room.contest,
          createdBy: currentUser.uid,
          participants: Array.from(room.participants.keys()),
        })

      // Notify all participants
      io.to(currentRoom).emit("contest_started", room.contest)

      console.log(`Contest started in room ${currentRoom}`)
    } catch (error) {
      socket.emit("error", { message: "Failed to start contest" })
    }
  })

  // Handle code submission
  socket.on("submit_code", async (submissionData) => {
    if (!currentUser || !currentRoom) return

    try {
      const room = activeRooms.get(currentRoom)
      if (!room || !room.contest?.isActive) {
        socket.emit("error", { message: "No active contest" })
        return
      }

      // Process submission (this will be handled by the submission service)
      const submission = {
        id: generateSubmissionId(),
        userId: currentUser.uid,
        roomCode: currentRoom,
        code: submissionData.code,
        language: submissionData.language,
        timestamp: new Date(),
        status: "pending",
      }

      // Save submission to database
      await db.collection("submissions").doc(submission.id).set(submission)

      // Notify user about submission received
      socket.emit("submission_received", { submissionId: submission.id })

      // Update room participants
      const participant = room.participants.get(currentUser.uid)
      if (participant) {
        participant.submissions += 1
        participant.timeSpent = Math.floor((new Date() - room.contest.startTime) / 1000)
      }

      // Notify room about new submission
      socket.to(currentRoom).emit("new_submission", {
        user: currentUser.name,
        submissionCount: participant?.submissions || 0,
      })

      console.log(`Code submitted by ${currentUser.name} in room ${currentRoom}`)
    } catch (error) {
      socket.emit("error", { message: "Failed to submit code" })
    }
  })

  // Handle chat messages
  socket.on("send_message", async (messageData) => {
    console.log("Received send_message event:", messageData, "currentUser:", currentUser, "currentRoom:", currentRoom)
    if (!currentUser || !currentRoom || typeof currentRoom !== "string" || !currentRoom.trim()) {
      console.log("send_message: Not authenticated or not in a room");
      return;
    }

    try {
      const room = activeRooms.get(currentRoom)
      if (!room) {
        console.log("send_message: Room not found", currentRoom);
        return;
      }

      // Support both string and object for messageData
      const messageText =
        typeof messageData === "string"
          ? messageData
          : (messageData && messageData.message) || ""

      if (!messageText.trim()) {
        console.log("send_message: Empty message");
        return;
      }

      const message = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        user: currentUser.name,
        avatar: currentUser.avatar,
        message: messageText,
        timestamp: new Date().toISOString(), // Ensure timestamp is a string
      }

      // Add to room messages
      room.messages.push(message)

      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100)
      }

      // Ensure room document exists before adding message
      if (currentRoom && typeof currentRoom === "string" && currentRoom.trim() !== "") {
        const roomRef = db.collection("rooms").doc(currentRoom)
        const roomDoc = await roomRef.get()
        if (!roomDoc.exists) {
          await roomRef.set({
            code: currentRoom,
            participants: [currentUser.uid],
            createdAt: new Date(),
            isActive: true,
            lastActivity: new Date(),
          })
          await new Promise(res => setTimeout(res, 500))
        }
        // Add retry logic for adding message with logging
        const tryAddMessage = async (msg, retries = 5) => {
          try {
            await db.collection("rooms").doc(currentRoom).collection("messages").add(msg)
            console.log("Message saved to Firestore:", msg)
          } catch (err) {
            console.error("Error saving message to Firestore:", err)
            if (err.code === 5 && retries > 0) {
              await new Promise(res => setTimeout(res, 500))
              await roomRef.set({
                code: currentRoom,
                participants: [currentUser.uid],
                createdAt: new Date(),
                isActive: true,
                lastActivity: new Date(),
              }, { merge: true })
              await tryAddMessage(msg, retries - 1)
            } else {
              throw err
            }
          }
        }
        await tryAddMessage(message)
      } else {
        console.error("Invalid currentRoom for Firestore:", currentRoom)
      }

      // Debug log: show message sent
      console.log(`Message sent by ${currentUser.name} in room ${currentRoom}:`, messageText);

      // Broadcast to room (including sender)
      io.to(currentRoom).emit("new_message", message)
    } catch (error) {
      console.error("Failed to send message:", error)
      socket.emit("error", { message: "Failed to send message" })
    }
  })

  // Update leaderboard
  socket.on("update_leaderboard", async (leaderboardData) => {
    if (!currentRoom) return

    try {
      const room = activeRooms.get(currentRoom)
      if (!room) return

      room.leaderboard = leaderboardData

      // Broadcast updated leaderboard
      io.to(currentRoom).emit("leaderboard_updated", room.leaderboard)
    } catch (error) {
      console.error("Failed to update leaderboard:", error)
    }
  })

  // Handle disconnection
  socket.on("disconnect", async () => {
    if (currentUser && currentRoom) {
      try {
        const room = activeRooms.get(currentRoom)
        if (room) {
          room.participants.delete(currentUser.uid)

          // Notify room about user leaving
          socket.to(currentRoom).emit("user_left", {
            user: currentUser,
            participantCount: room.participants.size,
          })
        }

        await updateRoomParticipants(currentRoom, currentUser.uid, "leave")
        userSockets.delete(currentUser.uid)

        console.log(`User ${currentUser.name} disconnected`)
        console.log(`User ${currentUser.name} disconnected from room ${currentRoom}`)
      } catch (error) {
        console.error("Error handling disconnect:", error)
      }
    }
  })
}

async function updateRoomParticipants(roomCode, userId, action) {
  try {
    const roomRef = db.collection("rooms").doc(roomCode)
    let roomDoc = await roomRef.get()

    // Retry .set() if document creation is not visible yet
    const trySet = async (data, retries = 2) => {
      try {
        await roomRef.set(data)
      } catch (err) {
        if (err.code === 5 && retries > 0) {
          await new Promise(res => setTimeout(res, 500))
          await trySet(data, retries - 1)
        } else {
          throw err
        }
      }
    }

    if (!roomDoc.exists) {
      // Always create the room document if it doesn't exist
      await trySet({
        code: roomCode,
        participants: action === "leave" ? [] : [userId],
        createdAt: new Date(),
        isActive: true,
        lastActivity: new Date(),
      })
      // Wait for Firestore to propagate the new document
      await new Promise(res => setTimeout(res, 300))
      // Re-fetch the doc after creation
      roomDoc = await roomRef.get()
      if (action === "leave") return
    }

    const participants = roomDoc.exists ? (roomDoc.data().participants || []) : []

    // Retry update if NOT_FOUND error occurs
    const tryUpdate = async (updateObj, retries = 2) => {
      try {
        await roomRef.update(updateObj)
      } catch (err) {
        if (err.code === 5 && retries > 0) {
          // NOT_FOUND: wait and retry
          await new Promise(res => setTimeout(res, 500))
          await trySet({
            code: roomCode,
            participants: participants,
            createdAt: new Date(),
            isActive: true,
            lastActivity: new Date(),
          })
          await tryUpdate(updateObj, retries - 1)
        } else {
          throw err
        }
      }
    }

    if (action === "join" && !participants.includes(userId)) {
      await tryUpdate({
        participants: [...participants, userId],
        lastActivity: new Date(),
      })
    } else if (action === "leave") {
      await tryUpdate({
        participants: participants.filter((id) => id !== userId),
        lastActivity: new Date(),
      })
    }
  } catch (error) {
    console.error("Error updating room participants:", error)
  }
}

function generateSubmissionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
