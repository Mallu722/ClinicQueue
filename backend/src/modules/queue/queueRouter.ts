import { Router, Request, Response } from 'express'
import { memoryStore } from '../../database/memoryStore'

const router = Router()

// Helper: Calculate queue metrics & wait times
function calculateQueueMetrics(clinicId: string) {
  const clinic = memoryStore.clinics.find(c => c.id === clinicId) || memoryStore.clinics[0]
  const entries = memoryStore.queueEntries.filter(q => q.clinicId === clinic.id)

  const activeInConsultation = entries.find(q => q.status === 'IN_CONSULTATION')
  const waitingEntries = entries.filter(q => q.status === 'WAITING').sort((a, b) => a.tokenNumber - b.tokenNumber)
  const completedEntries = entries.filter(q => q.status === 'COMPLETED')

  const currentToken = activeInConsultation ? activeInConsultation.tokenNumber : null
  const nextToken = waitingEntries.length > 0 ? waitingEntries[0].tokenNumber : null
  const totalWaiting = waitingEntries.length
  const totalCompleted = completedEntries.length

  // Recalculate dynamic estimated waiting times
  const avgTimePerPatient = 12
  const delayMinutes = clinic.currentDelayMinutes || 0

  waitingEntries.forEach((entry, idx) => {
    const rawWait = (idx + 1) * avgTimePerPatient + delayMinutes
    entry.estimatedWaitMinutes = rawWait
  })

  return {
    clinicId: clinic.id,
    clinicName: clinic.name,
    clinicStatus: clinic.status,
    delayMinutes,
    currentToken,
    nextToken,
    activeInConsultation,
    totalWaiting,
    totalCompleted,
    waitingEntries,
    recentEntries: entries.slice(-15).reverse(),
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

// GET /api/v1/queue/live
router.get('/live', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const metrics = calculateQueueMetrics(clinicId)
  return res.json({ success: true, data: metrics })
})

// GET /api/v1/queue/token-status/:tokenNumber (Public tracking)
router.get('/token-status/:tokenNumber', (req: Request, res: Response) => {
  const tokenNum = parseInt(String(req.params.tokenNumber), 10)
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id

  const entry = memoryStore.queueEntries.find(
    q => q.clinicId === clinicId && q.tokenNumber === tokenNum
  )

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: `Token #${tokenNum} not found in today's active clinic session`,
    })
  }

  const waitingAhead = memoryStore.queueEntries.filter(
    q => q.clinicId === clinicId && q.status === 'WAITING' && q.tokenNumber < entry.tokenNumber
  ).length

  const clinic = memoryStore.clinics.find(c => c.id === clinicId) || memoryStore.clinics[0]
  const doctor = memoryStore.doctors.find(d => d.id === entry.doctorId)

  // Estimated wait range format e.g. "15-20 mins"
  const minWait = Math.max(0, waitingAhead * 10 + clinic.currentDelayMinutes)
  const maxWait = Math.max(5, (waitingAhead + 1) * 15 + clinic.currentDelayMinutes)
  const estimatedWaitRange = entry.status === 'IN_CONSULTATION' 
    ? 'Now with Doctor' 
    : entry.status === 'COMPLETED' 
    ? 'Completed' 
    : `${minWait} - ${maxWait} mins`

  return res.json({
    success: true,
    data: {
      ...entry,
      patientsAhead: waitingAhead,
      estimatedWaitRange,
      doctorName: doctor?.displayName || entry.doctorName,
      doctorSpecialization: doctor?.specialization || 'Consultant',
      clinicStatus: clinic.status,
      clinicDelayMinutes: clinic.currentDelayMinutes,
    },
  })
})

// POST /api/v1/queue/entries (Issue new token - walk-in or appointment check-in)
router.post('/entries', (req: Request, res: Response) => {
  const {
    clinicId = memoryStore.clinics[0].id,
    doctorId = memoryStore.doctors[0].id,
    patientName,
    patientPhone,
    preferredLanguage = 'en',
    priority = 0,
    appointmentId,
    reason,
  } = req.body

  if (!patientName || !patientPhone) {
    return res.status(400).json({ success: false, error: 'Patient name and phone number are required' })
  }

  // Find or register patient
  let patient = memoryStore.patients.find(
    p => p.clinicId === clinicId && p.phone.replace(/\D/g, '').endsWith(patientPhone.replace(/\D/g, '').slice(-10))
  )

  if (!patient) {
    const nextRef = `CQ-2026-${(memoryStore.patients.length + 1).toString().padStart(3, '0')}`
    patient = {
      id: `pat-${Date.now()}`,
      clinicId,
      patientReference: nextRef,
      displayName: patientName,
      phone: patientPhone,
      gender: req.body.gender || 'Unknown',
      age: req.body.age ? parseInt(req.body.age, 10) : 30,
      address: req.body.address || 'Hubli',
      preferredLanguage: preferredLanguage as 'en' | 'hi' | 'kn',
      whatsappConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    memoryStore.patients.push(patient)
  }

  // Allocate token concurrency-safely
  const entry = memoryStore.allocateNextToken(
    clinicId,
    doctorId,
    patient.id,
    patient.displayName,
    patient.phone,
    preferredLanguage,
    priority,
    appointmentId
  )

  // Auto-send WhatsApp confirmation if enabled
  const notif = {
    id: `notif-${Date.now()}`,
    clinicId,
    patientId: patient.id,
    patientPhone: patient.phone,
    recipientName: patient.displayName,
    channel: 'WHATSAPP' as const,
    notificationType: 'QUEUE_ALERT' as const,
    messageContent: `Namaste ${patient.displayName}. Your token #${entry.tokenNumber} has been generated at Shanti Ayush Clinic. Approx wait: ${entry.estimatedWaitMinutes} mins.`,
    templateName: 'queue_token_generated_v1',
    scheduledAt: new Date().toISOString(),
    status: 'DELIVERED' as const,
    providerMessageId: `wamid.GEN${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  memoryStore.notifications.unshift(notif)

  return res.status(201).json({
    success: true,
    data: {
      entry,
      patient,
      whatsappNotificationSent: true,
    },
  })
})

// POST /api/v1/queue/call-next (Doctor or Receptionist calls next patient)
router.post('/call-next', (req: Request, res: Response) => {
  const clinicId = (req.body.clinicId as string) || memoryStore.clinics[0].id
  const doctorId = (req.body.doctorId as string) || memoryStore.doctors[0].id

  // Mark current IN_CONSULTATION as COMPLETED
  const currentActive = memoryStore.queueEntries.find(
    q => q.clinicId === clinicId && q.doctorId === doctorId && q.status === 'IN_CONSULTATION'
  )

  if (currentActive) {
    currentActive.status = 'COMPLETED'
    currentActive.completedAt = new Date().toISOString()
  }

  // Find next in WAITING
  const nextWaiting = memoryStore.queueEntries
    .filter(q => q.clinicId === clinicId && q.doctorId === doctorId && q.status === 'WAITING')
    .sort((a, b) => (b.priority - a.priority) || (a.tokenNumber - b.tokenNumber))[0]

  if (!nextWaiting) {
    return res.json({
      success: true,
      message: 'No more patients waiting in queue',
      previousCompleted: currentActive,
      calledToken: null,
    })
  }

  nextWaiting.status = 'IN_CONSULTATION'
  nextWaiting.consultationStartedAt = new Date().toISOString()

  return res.json({
    success: true,
    message: `Now calling Token #${nextWaiting.tokenNumber}`,
    previousCompleted: currentActive,
    calledToken: nextWaiting,
  })
})

// PATCH /api/v1/queue/entries/:id/status
router.patch('/entries/:id/status', (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
  }

  const entry = memoryStore.queueEntries.find(q => q.id === id)
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Queue entry not found' })
  }

  entry.status = status
  if (status === 'IN_CONSULTATION') entry.consultationStartedAt = new Date().toISOString()
  if (status === 'COMPLETED') entry.completedAt = new Date().toISOString()

  return res.json({ success: true, data: entry })
})

export const queueRouter = router
