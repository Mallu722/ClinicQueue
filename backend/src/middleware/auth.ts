import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'OWNER' | 'RECEPTIONIST' | 'CLINICIAN' | 'PATIENT'
  clinicId: string
  displayName: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const simulatedRole = req.headers['x-simulated-role'] as string
  const simulatedClinic = (req.headers['x-clinic-id'] as string) || 'clinic-shanti-hubli-001'

  // Support demo role header for easy pair-testing or JWT
  if (simulatedRole) {
    req.user = {
      id: `user-${simulatedRole.toLowerCase()}`,
      email: `${simulatedRole.toLowerCase()}@clinicqueue.in`,
      role: simulatedRole.toUpperCase() as AuthenticatedUser['role'],
      clinicId: simulatedClinic,
      displayName: `${simulatedRole} User`,
    }
    return next()
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default fallback to public or receptionist for development convenience
    req.user = {
      id: 'user-demo',
      email: 'reception@clinicqueue.in',
      role: 'RECEPTIONIST',
      clinicId: simulatedClinic,
      displayName: 'Receptionist User',
    }
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' })
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No credentials provided' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      })
    }

    next()
  }
}
