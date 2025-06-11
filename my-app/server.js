// Node server to handle socket connections

import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import fs from "fs"
import https from "https"

// Import route handlers
import authRoutes from "./routes/auth.js"
import contestRoutes from "./routes/contests.js"
import submissionRoutes from "./routes/submissions.js"
import roomRoutes from "./routes/rooms.js"

// Import socket handlers
import { handleConnection } from "./socket/socketHandlers.js"

dotenv.config()

const app = express()

let server;
if (process.env.USE_HTTPS === "true") {
  const options = {
    key: fs.readFileSync("/workspaces/coders/my-app/cert/key.pem"),
    cert: fs.readFileSync("/workspaces/coders/my-app/cert/cert.pem"),
  };
  server = https.createServer(options, app);
} else {
  server = createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export const db = getFirestore()
export const auth = getAuth()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/contests", contestRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/rooms", roomRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)
  handleConnection(socket, io)
})

const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready for connections`)
})

export { io }
