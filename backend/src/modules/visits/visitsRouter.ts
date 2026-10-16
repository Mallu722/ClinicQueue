import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { memoryStore, IVisit, IPrescriptionItem, IFollowUpPlan } from '../../database/memoryStore'

const router = Router()

// GET /api/v1/visits
router.get('/', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const doctorId = req.query.doctorId as string
  const patientId = req.query.patientId as string

  let list = memoryStore.visits.filter(v => v.clinicId === clinicId)
  if (doctorId) list = list.filter(v => v.doctorId === doctorId)
  if (patientId) list = list.filter(v => v.patientId === patientId)

  return res.json({ success: true, count: list.length, data: list.reverse() })
})

// POST /api/v1/visits (Complete doctor consultation, record clinical notes, rx & follow up)
router.post('/', (req: Request, res: Response) => {
  const {
    clinicId = memoryStore.clinics[0].id,
    patientId,
    doctorId = memoryStore.doctors[0].id,
    reasonForVisit,
    assessment,
    clinicalNotes,
    prescriptions = [],
    followUpDate,
    followUpNotes,
    queueEntryId,
  } = req.body

  if (!patientId || !reasonForVisit) {
    return res.status(400).json({ success: false, error: 'Patient ID and reason for visit are required' })
  }

  const patient = memoryStore.patients.find(p => p.id === patientId)
  const doctor = memoryStore.doctors.find(d => d.id === doctorId)

  const visitId = `vis-${uuidv4().substring(0, 8)}`

  // Format prescriptions
  const formattedPrescriptions: IPrescriptionItem[] = prescriptions.map((p: any) => ({
    id: uuidv4(),
    medicineName: p.medicineName || 'Medicine',
    strength: p.strength || '',
    dosage: p.dosage || '1 tab',
    frequency: p.frequency || '1-0-1',
    duration: p.duration || '5 days',
    instructions: p.instructions || 'After meals',
  }))

  // Format follow-up if provided
  let followUpPlan: IFollowUpPlan | undefined
  if (followUpDate) {
    followUpPlan = {
      id: uuidv4(),
      clinicId,
      visitId,
      patientId,
      patientName: patient?.displayName || 'Patient',
      scheduledDate: followUpDate,
      status: 'UPCOMING',
      notes: followUpNotes,
      createdAt: new Date().toISOString(),
    }
  }

  const visit: IVisit = {
    id: visitId,
    clinicId,
    patientId,
    patientName: patient?.displayName || 'Patient',
    doctorId,
    doctorName: doctor?.displayName || 'Consulting Doctor',
    visitDate: new Date().toISOString(),
    status: 'COMPLETED',
    clinicalNote: {
      id: uuidv4(),
      clinicId,
      visitId,
      reasonForVisit,
      assessment: assessment || 'Clinical evaluation completed',
      clinicalNotes: clinicalNotes || '',
      authorName: doctor?.displayName || 'Doctor',
      createdAt: new Date().toISOString(),
    },
    prescriptions: formattedPrescriptions,
    followUp: followUpPlan,
    createdAt: new Date().toISOString(),
  }

  memoryStore.visits.push(visit)

  // If connected to a queue entry, mark it completed
  if (queueEntryId) {
    const queueEntry = memoryStore.queueEntries.find(q => q.id === queueEntryId)
    if (queueEntry) {
      queueEntry.status = 'COMPLETED'
      queueEntry.completedAt = new Date().toISOString()
    }
  }

  // Auto-send WhatsApp prescription summary / follow up reminder if consented
  if (patient?.whatsappConsent) {
    const notif = {
      id: `notif-${Date.now()}`,
      clinicId,
      patientId: patient.id,
      patientPhone: patient.phone,
      recipientName: patient.displayName,
      channel: 'WHATSAPP' as const,
      notificationType: 'FOLLOW_UP' as const,
      messageContent: `Namaste ${patient.displayName}. Your consultation with ${doctor?.displayName} is complete. ${formattedPrescriptions.length} medications prescribed. Follow-up: ${followUpDate || 'As needed'}. Wish you good health!`,
      templateName: 'consultation_summary_v1',
      scheduledAt: new Date().toISOString(),
      status: 'DELIVERED' as const,
      providerMessageId: `wamid.VIS${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    memoryStore.notifications.unshift(notif)
  }

  return res.status(201).json({
    success: true,
    message: 'Consultation visit recorded successfully',
    data: visit,
  })
})

export const visitsRouter = router
