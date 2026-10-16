import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { memoryStore, IAppointment } from '../../database/memoryStore'

const router = Router()

// GET /api/v1/appointments
router.get('/', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const date = req.query.date as string
  const doctorId = req.query.doctorId as string

  let list = memoryStore.appointments.filter(a => a.clinicId === clinicId)
  if (date) list = list.filter(a => a.scheduledDate === date)
  if (doctorId) list = list.filter(a => a.doctorId === doctorId)

  return res.json({ success: true, count: list.length, data: list.reverse() })
})

// GET /api/v1/appointments/slots (Calculate slots based on working hours)
router.get('/slots', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0]
  const doctorId = (req.query.doctorId as string) || memoryStore.doctors[0].id

  // Generate 15-minute slot intervals from 09:30 AM to 01:00 PM and 05:00 PM to 08:30 PM
  const morningSlots = [
    '09:30 AM', '09:50 AM', '10:10 AM', '10:30 AM', '10:50 AM',
    '11:10 AM', '11:30 AM', '11:50 AM', '12:10 PM', '12:30 PM'
  ]
  const eveningSlots = [
    '05:00 PM', '05:20 PM', '05:40 PM', '06:00 PM', '06:20 PM',
    '06:40 PM', '07:00 PM', '07:20 PM', '07:40 PM', '08:00 PM'
  ]
  const allSlots = [...morningSlots, ...eveningSlots]

  // Find booked slots for this doctor on this date
  const booked = memoryStore.appointments
    .filter(a => a.clinicId === clinicId && a.doctorId === doctorId && a.scheduledDate === date && a.status !== 'CANCELLED')
    .map(a => a.scheduledTime)

  const slots = allSlots.map(time => ({
    time,
    available: !booked.includes(time),
    shift: time.includes('AM') || time.startsWith('12:') ? 'Morning' : 'Evening',
  }))

  return res.json({ success: true, date, doctorId, slots })
})

// POST /api/v1/appointments (Book appointment)
router.post('/', (req: Request, res: Response) => {
  const {
    clinicId = memoryStore.clinics[0].id,
    doctorId = memoryStore.doctors[0].id,
    patientName,
    patientPhone,
    scheduledDate,
    scheduledTime,
    reason = 'General consultation',
    preferredLanguage = 'en',
    source = 'ONLINE',
  } = req.body

  if (!patientName || !patientPhone || !scheduledDate || !scheduledTime) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: patientName, patientPhone, scheduledDate, scheduledTime',
    })
  }

  // Prevent double booking at the same doctor and slot
  const isDuplicate = memoryStore.appointments.some(
    a => a.clinicId === clinicId &&
         a.doctorId === doctorId &&
         a.scheduledDate === scheduledDate &&
         a.scheduledTime === scheduledTime &&
         a.status !== 'CANCELLED'
  )

  if (isDuplicate) {
    return res.status(409).json({
      success: false,
      error: 'This slot has already been booked. Please choose another time slot.',
    })
  }

  // Find or create patient
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
      age: req.body.age ? parseInt(req.body.age, 10) : 32,
      address: req.body.address || 'Hubli',
      preferredLanguage: preferredLanguage as 'en' | 'hi' | 'kn',
      whatsappConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    memoryStore.patients.push(patient)
  }

  const doctor = memoryStore.doctors.find(d => d.id === doctorId)

  const appointment: IAppointment = {
    id: `apt-${uuidv4().substring(0, 8)}`,
    clinicId,
    doctorId,
    patientId: patient.id,
    patientName: patient.displayName,
    patientPhone: patient.phone,
    doctorName: doctor?.displayName || 'Dr. Ramesh Hegde',
    scheduledDate,
    scheduledTime,
    status: source === 'ONLINE' ? 'REQUESTED' : 'CONFIRMED',
    source,
    reason,
    createdAt: new Date().toISOString(),
  }

  memoryStore.appointments.push(appointment)

  // Send WhatsApp Booking Alert
  const notif = {
    id: `notif-${Date.now()}`,
    clinicId,
    patientId: patient.id,
    patientPhone: patient.phone,
    recipientName: patient.displayName,
    channel: 'WHATSAPP' as const,
    notificationType: 'CONFIRMATION' as const,
    messageContent: `Namaste ${patient.displayName}. Your appointment request for ${scheduledDate} at ${scheduledTime} with ${appointment.doctorName} at Shanti Ayush Clinic has been received.`,
    templateName: 'appointment_request_v1',
    scheduledAt: new Date().toISOString(),
    status: 'DELIVERED' as const,
    providerMessageId: `wamid.APT${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  memoryStore.notifications.unshift(notif)

  return res.status(201).json({
    success: true,
    message: 'Appointment scheduled successfully',
    data: appointment,
  })
})

// PATCH /api/v1/appointments/:id/status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body

  const appointment = memoryStore.appointments.find(a => a.id === id)
  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Appointment not found' })
  }

  appointment.status = status
  return res.json({ success: true, data: appointment })
})

export const appointmentsRouter = router
