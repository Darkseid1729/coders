import { io, Socket } from "socket.io-client"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"],
  withCredentials: true,
})

// Extend the type to include on/off/emit
type SocketService = {
  getSocket: () => Socket
  joinRoom: (roomCode: string) => void
  startContest: (contestData: any) => void
  isSocketConnected: () => boolean
  on: Socket["on"]
  off: Socket["off"]
  emit: Socket["emit"]
  connect: Socket["connect"]
  disconnect: Socket["disconnect"]
  sendMessage: (message: string | { message: string }) => void
  submitCode: (submissionData: any) => void
}

export const socketService: SocketService = {
  getSocket: () => socket,
  joinRoom: (roomCode: string) => socket.emit("join_room", roomCode), // <-- fix here
  startContest: (contestData: any) => socket.emit("start_contest", contestData),
  isSocketConnected: () => socket.connected,
  on: socket.on.bind(socket),
  off: socket.off.bind(socket),
  emit: socket.emit.bind(socket),
  connect: socket.connect.bind(socket),
  disconnect: socket.disconnect.bind(socket),
  sendMessage: (message) => socket.emit("send_message", message),
  submitCode: (submissionData) => socket.emit("submit_code", submissionData),
}

// Usage in components:
// socketService.connect()
// socketService.disconnect()
// socketService.on("event", handler)
// or socketService.getSocket().on("event", handler)
