class MockApiService {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    console.log("API token set:", token.substring(0, 20) + "...")
  }

  private async mockRequest(endpoint: string, options: any = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    console.log(`[API] ${options.method || "GET"} ${endpoint}`)

    // Mock responses based on endpoint
    switch (endpoint) {
      case "/auth/verify":
        return {
          user: {
            uid: "demo_user",
            email: "demo@codeclash.com",
            name: "Demo User",
            avatar: "/placeholder.svg",
            totalScore: 0,
            contestsParticipated: 0,
            problemsSolved: 0,
          },
        }

      case "/auth/profile":
        return {
          user: {
            uid: "demo_user",
            email: "demo@codeclash.com",
            name: "Demo User",
            avatar: "/placeholder.svg",
            totalScore: 1250,
            contestsParticipated: 7,
            problemsSolved: 18,
          },
        }

      case "/auth/stats":
        return {
          stats: {
            totalSubmissions: 45,
            acceptedSubmissions: 32,
            problemsSolved: 18,
            contestsParticipated: 7,
            averageScore: 85,
            acceptanceRate: 71,
          },
        }

      case "/rooms/create":
        return {
          room: {
            code: "ROOM" + Math.random().toString(36).substr(2, 6).toUpperCase(),
            name: "Demo Contest Room",
            createdBy: "demo_user",
            participants: ["demo_user"],
            isActive: true,
          },
        }

      default:
        if (endpoint.startsWith("/rooms/join/")) {
          return { message: "Joined room successfully" }
        }
        if (endpoint.startsWith("/rooms/")) {
          return {
            room: {
              code: endpoint.split("/")[2],
              name: "Demo Contest Room",
              participants: ["demo_user", "user2", "user3"],
              isActive: true,
            },
          }
        }
        if (endpoint.startsWith("/contests/")) {
          return {
            contest: {
              id: endpoint.split("/")[2],
              title: "Demo Contest",
              problems: ["two-sum"],
              isActive: true,
            },
          }
        }
        return { success: true }
    }
  }

  // Auth endpoints
  async verifyToken() {
    return this.mockRequest("/auth/verify", { method: "POST" })
  }

  async getProfile() {
    return this.mockRequest("/auth/profile")
  }

  async updateProfile(data: { name?: string; avatar?: string }) {
    return this.mockRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getStats() {
    return this.mockRequest("/auth/stats")
  }

  // Room endpoints
  async createRoom(data: { name: string; description?: string; isPrivate?: boolean }) {
    return this.mockRequest("/rooms/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async joinRoom(roomCode: string) {
    return this.mockRequest(`/rooms/join/${roomCode}`, { method: "POST" })
  }

  async getRoomDetails(roomCode: string) {
    return this.mockRequest(`/rooms/${roomCode}`)
  }

  async getRoomMessages(roomCode: string, limit = 50) {
    return this.mockRequest(`/rooms/${roomCode}/messages?limit=${limit}`)
  }

  async leaveRoom(roomCode: string) {
    return this.mockRequest(`/rooms/leave/${roomCode}`, { method: "POST" })
  }

  async listRooms(limit = 20) {
    return this.mockRequest(`/rooms?limit=${limit}`)
  }

  // Contest endpoints
  async createContest(data: any) {
    return this.mockRequest("/contests/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getContest(contestId: string) {
    return this.mockRequest(`/contests/${contestId}`)
  }

  async getLeaderboard(contestId: string) {
    return this.mockRequest(`/contests/${contestId}/leaderboard`)
  }

  async seedProblems() {
    return this.mockRequest("/contests/seed-problems", { method: "POST" })
  }

  // Submission endpoints
  async submitCode(data: { code: string; language: string; problemId: string; roomCode: string }) {
    return this.mockRequest("/submissions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSubmissionResult(submissionId: string) {
    return this.mockRequest(`/submissions/result/${submissionId}`)
  }

  async getUserSubmissions(problemId: string) {
    return this.mockRequest(`/submissions/user/${problemId}`)
  }
}

export const apiService = new MockApiService()
