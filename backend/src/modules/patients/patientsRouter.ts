import { Router, Request, Response } from 'express'
import { memoryStore, IPatient } from '../../database/memoryStore'

const router = Router()

// GET /api/v1/patients (Search by phone, name, or MRN reference)
router.get('/', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const search = (req.query.search as string || '').toLowerCase().trim()

  let list = memoryStore.patients.filter(p => p.clinicId === clinicId)

  if (search) {
    list = list.filter(
      p =>
        p.displayName.toLowerCase().includes(search) ||
        p.phone.includes(search) ||
        p.patientReference.toLowerCase().includes(search)
    )
  }

  return res.json({ success: true, count: list.length, data: list.reverse() })
})

// GET /api/v1/patients/:id
router.get('/:id', (req: Request, res: Response) => {
  const patient = memoryStore.patients.find(p => p.id === req.params.id)
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' })
  }

  const visits = memoryStore.visits.filter(v => v.patientId === patient.id)
  const appointments = memoryStore.appointments.filter(a => a.patientId === patient.id)
  const notifications = memoryStore.notifications.filter(n => n.patientId === patient.id)

  return res.json({
    success: true,
    data: {
      ...patient,
      visits,
      appointments,
      notifications,
    },
  })
})

// POST /api/v1/patients (Register new patient)
router.post('/', (req: Request, res: Response) => {
  const {
    clinicId = memoryStore.clinics[0].id,
    displayName,
    phone,
    gender,
    age,
    address,
    preferredLanguage = 'en',
    whatsappConsent = true,
  } = req.body

  if (!displayName || !phone) {
    return res.status(400).json({ success: false, error: 'Name and phone number are required' })
  }

  const cleanPhone = phone.replace(/\D/g, '')
  const existing = memoryStore.patients.find(
    p => p.clinicId === clinicId && p.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
  )

  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Patient already registered under MRN: ${existing.patientReference}`,
      existingPatient: existing,
    })
  }

  const nextRef = `CQ-2026-${(memoryStore.patients.length + 1).toString().padStart(3, '0')}`

  const patient: IPatient = {
    id: `pat-${Date.now()}`,
    clinicId,
    patientReference: nextRef,
    displayName,
    phone,
    gender: gender || 'Not Specified',
    age: age ? parseInt(age, 10) : 35,
    address: address || 'Hubli',
    preferredLanguage,
    whatsappConsent: Boolean(whatsappConsent),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryStore.patients.push(patient)

  return res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    data: patient,
  })
})

// GET /api/v1/patients/:id/visits
router.get('/:id/visits', (req: Request, res: Response) => {
  const visits = memoryStore.visits.filter(v => v.patientId === req.params.id)
  return res.json({ success: true, count: visits.length, data: visits.reverse() })
})

export const patientsRouter = router
