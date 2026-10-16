import { Router, Request, Response } from 'express'
import { memoryStore } from '../../database/memoryStore'

const router = Router()

// GET /api/v1/clinics/:clinicId (Public or Authenticated)
router.get('/:clinicId', (req: Request, res: Response) => {
  const { clinicId } = req.params
  const clinic = memoryStore.clinics.find(c => c.id === clinicId || c.slug === clinicId) || memoryStore.clinics[0]
  const doctors = memoryStore.doctors.filter(d => d.clinicId === clinic.id)

  return res.json({
    success: true,
    data: {
      ...clinic,
      doctors,
    },
  })
})

// PATCH /api/v1/clinics/:clinicId
router.patch('/:clinicId', (req: Request, res: Response) => {
  const { clinicId } = req.params
  const clinic = memoryStore.clinics.find(c => c.id === clinicId)

  if (!clinic) {
    return res.status(404).json({ success: false, error: 'Clinic not found' })
  }

  const { status, currentDelayMinutes, bannerNotice, opdTimings } = req.body

  if (status !== undefined) clinic.status = status
  if (currentDelayMinutes !== undefined) clinic.currentDelayMinutes = Number(currentDelayMinutes)
  if (bannerNotice !== undefined) clinic.bannerNotice = bannerNotice
  if (opdTimings !== undefined) clinic.opdTimings = opdTimings
  clinic.updatedAt = new Date().toISOString()

  return res.json({ success: true, data: clinic })
})

// GET /api/v1/clinics/:clinicId/schedules
router.get('/:clinicId/schedules', (req: Request, res: Response) => {
  const { clinicId } = req.params
  const schedules = memoryStore.schedules.filter(s => s.clinicId === clinicId)
  return res.json({ success: true, data: schedules })
})

// GET /api/v1/clinics/:clinicId/doctors
router.get('/:clinicId/doctors', (req: Request, res: Response) => {
  const { clinicId } = req.params
  const doctors = memoryStore.doctors.filter(d => d.clinicId === clinicId)
  return res.json({ success: true, data: doctors })
})

export const clinicsRouter = router
