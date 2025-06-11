const WS_URL = "wss://rxqxzqeseopqudvjtomv.supabase.co/functions/v1/websocket-function"

let socket: WebSocket | null = null
let isConnected = false
const listeners: { [event: string]: ((data: any) => void)[] } = {}

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return
  socket = new WebSocket(WS_URL)
  socket.onopen = () => {
    isConnected = true
    listeners["open"]?.forEach(fn => fn({}))
  }
  socket.onclose = () => {
    isConnected = false
    listeners["close"]?.forEach(fn => fn({}))
  }
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    listeners[data.type || "message"]?.forEach(fn => fn(data))
  }
  socket.onerror = (err) => {
    listeners["error"]?.forEach(fn => fn(err))
  }
}

function disconnect() {
  socket?.close()
  socket = null
  isConnected = false
}

function emit(type: string, payload: any) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }))
  }
}

function on(event: string, handler: (data: any) => void) {
  listeners[event] = listeners[event] || []
  listeners[event].push(handler)
}

function off(event: string, handler: (data: any) => void) {
  listeners[event] = (listeners[event] || []).filter(fn => fn !== handler)
}

type SocketService = {
  connect: typeof connect
  disconnect: typeof disconnect
  isSocketConnected: () => boolean
  emit: typeof emit
  on: typeof on
  off: typeof off
  joinRoom: (roomCode: string) => void
  startContest: (contestData: any) => void
  sendMessage: (message: string | { message: string }) => void
  submitCode: (submissionData: any) => void
}

export const socketService: SocketService = {
  connect,
  disconnect,
  isSocketConnected: () => isConnected,
  emit,
  on,
  off,
  joinRoom: (roomCode: string) => emit("join_room", { roomCode }),
  startContest: (contestData: any) => emit("start_contest", { contestData }),
  sendMessage: (message) => emit("send_message", typeof message === "string" ? { message } : message),
  submitCode: (submissionData) => emit("submit_code", { submissionData }),
}

// Usage in components:
// socketService.connect()
// socketService.disconnect()
// socketService.on("message", handler) // or on("open"/"close"/"error")
// socketService.joinRoom("roomCode")
// socketService.sendMessage("hello")
// socketService.submitCode({ ... })
