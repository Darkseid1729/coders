import { auth } from "../server.js"

export async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" })
  }

  const token = authHeader.substring(7)

  verifyFirebaseToken(token)
    .then((decodedToken) => {
      req.user = decodedToken
      next()
    })
    .catch((error) => {
      res.status(401).json({ error: "Invalid token" })
    })
}
