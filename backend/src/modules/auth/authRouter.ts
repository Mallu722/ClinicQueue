import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { memoryStore } from '../../database/memoryStore'

const router = Router()

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, role } = req.body

  const matchedUser = memoryStore.users.find(
    u => (email && u.email.toLowerCase() === email.toLowerCase()) || (role && u.role === role.toUpperCase())
  ) || memoryStore.users[1] // fallback to receptionist

  const token = jwt.sign(
    {
      id: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      clinicId: matchedUser.clinicId,
      displayName: matchedUser.displayName,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  const clinic = memoryStore.clinics.find(c => c.id === matchedUser.clinicId)

  return res.json({
    success: true,
    data: {
      token,
      user: matchedUser,
      clinic,
    },
  })
})

// GET /api/v1/auth/me
router.get('/me', (req: Request, res: Response) => {
  const user = req.user || memoryStore.users[1]
  const clinic = memoryStore.clinics.find(c => c.id === user.clinicId)
  return res.json({
    success: true,
    data: {
      user,
      clinic,
    },
  })
})

// POST /api/v1/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' })
})

export const authRouter = router
