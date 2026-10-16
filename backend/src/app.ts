import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { config } from './config'
import { authRouter } from './modules/auth/authRouter'
import { clinicsRouter } from './modules/clinics/clinicsRouter'
import { appointmentsRouter } from './modules/appointments/appointmentsRouter'
import { queueRouter } from './modules/queue/queueRouter'
import { patientsRouter } from './modules/patients/patientsRouter'
import { visitsRouter } from './modules/visits/visitsRouter'
import { notificationsRouter } from './modules/notifications/notificationsRouter'
import { analyticsRouter } from './modules/analytics/analyticsRouter'

export const app = express()

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ClinicQueue API',
    version: '1.0.0',
    pilotClinic: 'Shanti Ayush Health Clinic - Hubli',
  })
})

// Root API Discovery
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'ClinicQueue REST API',
    version: '1.0.0',
    documentation: 'ClinicQueue TRD v1.0 Compliant Modular Monolith',
    endpoints: {
      auth: '/api/v1/auth',
      clinics: '/api/v1/clinics',
      appointments: '/api/v1/appointments',
      queue: '/api/v1/queue',
      patients: '/api/v1/patients',
      visits: '/api/v1/visits',
      notifications: '/api/v1/notifications',
      analytics: '/api/v1/analytics',
    },
  })
})

// Mount REST Modules
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/clinics', clinicsRouter)
app.use('/api/v1/appointments', appointmentsRouter)
app.use('/api/v1/queue', queueRouter)
app.use('/api/v1/patients', patientsRouter)
app.use('/api/v1/visits', visitsRouter)
app.use('/api/v1/notifications', notificationsRouter)
app.use('/api/v1/analytics', analyticsRouter)

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' })
})

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  })
})
