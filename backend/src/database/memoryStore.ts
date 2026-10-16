import { v4 as uuidv4 } from 'uuid'

export interface IClinic {
  id: string
  name: string
  slug: string
  address: string
  timezone: string
  phone: string
  status: 'ACTIVE' | 'DELAYED' | 'PAUSED' | 'CLOSED'
  currentDelayMinutes: number
  opdTimings: string
  emergencyContact: string
  bannerNotice?: string
  createdAt: string
  updatedAt: string
}

export interface IDoctor {
  id: string
  clinicId: string
  displayName: string
  specialization: string
  qualification: string
  status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_BREAK' | 'OFF_DUTY'
  consultationFee: number
  avgConsultationMinutes: number
}

export interface IDoctorSchedule {
  id: string
  clinicId: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  shiftName: string
}

export interface IUser {
  id: string
  email: string
  phone: string
  displayName: string
  role: 'OWNER' | 'RECEPTIONIST' | 'CLINICIAN' | 'PATIENT'
  clinicId: string
}

export interface IPatient {
  id: string
  clinicId: string
  patientReference: string // e.g. MRN-1001
  displayName: string
  phone: string
  gender: string
  age: number
  address: string
  preferredLanguage: 'en' | 'hi' | 'kn'
  whatsappConsent: boolean
  createdAt: string
  updatedAt: string
}

export interface IAppointment {
  id: string
  clinicId: string
  doctorId: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorName: string
  scheduledDate: string
  scheduledTime: string
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  source: 'ONLINE' | 'RECEPTION' | 'PHONE'
  reason: string
  createdAt: string
}

export interface IQueueEntry {
  id: string
  clinicId: string
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  patientPhone: string
  appointmentId?: string
  queueSessionId: string
  tokenNumber: number
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED'
  priority: number // 0 = standard, 1 = senior, 2 = emergency
  estimatedWaitMinutes: number
  checkedInAt: string
  consultationStartedAt?: string
  completedAt?: string
  preferredLanguage: 'en' | 'hi' | 'kn'
}

export interface IClinicalNote {
  id: string
  clinicId: string
  visitId: string
  reasonForVisit: string
  assessment: string
  clinicalNotes: string
  authorName: string
  createdAt: string
}

export interface IPrescriptionItem {
  id: string
  medicineName: string
  strength: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface IFollowUpPlan {
  id: string
  clinicId: string
  visitId: string
  patientId: string
  patientName: string
  scheduledDate: string
  status: 'UPCOMING' | 'DUE' | 'COMPLETED' | 'OVERDUE'
  notes?: string
  createdAt: string
}

export interface IVisit {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  visitDate: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  clinicalNote?: IClinicalNote
  prescriptions: IPrescriptionItem[]
  followUp?: IFollowUpPlan
  createdAt: string
}

export interface INotification {
  id: string
  clinicId: string
  patientId: string
  patientPhone: string
  recipientName: string
  channel: 'WHATSAPP' | 'SMS'
  notificationType: 'CONFIRMATION' | 'REMINDER_24H' | 'QUEUE_ALERT' | 'FOLLOW_UP' | 'DELAY_ALERT'
  messageContent: string
  templateName: string
  scheduledAt: string
  status: 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  providerMessageId: string
  createdAt: string
}

export interface IAuditLog {
  id: string
  clinicId: string
  actor: string
  action: string
  resourceType: string
  resourceId: string
  metadata?: Record<string, unknown>
  occurredAt: string
}

// In-Memory Database store with pre-seeded data for Tier-2/3 Indian Clinic
class MemoryStore {
  public clinics: IClinic[] = []
  public doctors: IDoctor[] = []
  public schedules: IDoctorSchedule[] = []
  public users: IUser[] = []
  public patients: IPatient[] = []
  public appointments: IAppointment[] = []
  public queueEntries: IQueueEntry[] = []
  public visits: IVisit[] = []
  public notifications: INotification[] = []
  public auditLogs: IAuditLog[] = []
  
  // Concurrency-safe token counter per clinic & date session
  private sessionTokenCounters: Map<string, number> = new Map()

  constructor() {
    this.seedInitialData()
  }

  private seedInitialData() {
    const clinicId = 'clinic-shanti-hubli-001'
    
    // 1. Clinic
    this.clinics.push({
      id: clinicId,
      name: 'Shanti Ayush Health Clinic',
      slug: 'shanti-clinic-hubli',
      address: 'Main Road, Near Old Bus Stand, Vidyanagar, Hubli - 580021, Karnataka',
      timezone: 'Asia/Kolkata',
      phone: '+91 836 2244 5500',
      status: 'ACTIVE',
      currentDelayMinutes: 0,
      opdTimings: 'Morning: 09:00 AM - 01:30 PM | Evening: 05:00 PM - 09:00 PM (Mon-Sat)',
      emergencyContact: '+91 94800 12345',
      bannerNotice: 'Clinic operating normally. Token generation live.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 2. Doctors
    const doc1Id = 'doc-ramesh-hegde'
    const doc2Id = 'doc-ananya-rao'
    this.doctors.push(
      {
        id: doc1Id,
        clinicId,
        displayName: 'Dr. Ramesh Hegde',
        specialization: 'General Physician & Diabetology',
        qualification: 'MBBS, MD (Internal Medicine)',
        status: 'AVAILABLE',
        consultationFee: 350,
        avgConsultationMinutes: 12,
      },
      {
        id: doc2Id,
        clinicId,
        displayName: 'Dr. Ananya Rao',
        specialization: 'Consultant Pediatrician & Child Health',
        qualification: 'MBBS, DCH, DNB (Pediatrics)',
        status: 'AVAILABLE',
        consultationFee: 400,
        avgConsultationMinutes: 15,
      }
    )

    // 3. Doctor Schedules
    this.schedules.push(
      { id: uuidv4(), clinicId, doctorId: doc1Id, dayOfWeek: 1, startTime: '09:00', endTime: '13:30', shiftName: 'Morning OPD' },
      { id: uuidv4(), clinicId, doctorId: doc1Id, dayOfWeek: 1, startTime: '17:00', endTime: '21:00', shiftName: 'Evening OPD' },
      { id: uuidv4(), clinicId, doctorId: doc2Id, dayOfWeek: 1, startTime: '10:00', endTime: '14:00', shiftName: 'Pediatric Clinic' },
      { id: uuidv4(), clinicId, doctorId: doc1Id, dayOfWeek: 2, startTime: '09:00', endTime: '13:30', shiftName: 'Morning OPD' },
      { id: uuidv4(), clinicId, doctorId: doc2Id, dayOfWeek: 2, startTime: '10:00', endTime: '14:00', shiftName: 'Pediatric Clinic' }
    )

    // 4. Users (Demo credentials for all roles)
    this.users.push(
      {
        id: 'user-owner',
        email: 'owner@clinicqueue.in',
        phone: '+919845011111',
        displayName: 'Dr. Ramesh Hegde (Owner)',
        role: 'OWNER',
        clinicId,
      },
      {
        id: 'user-receptionist',
        email: 'reception@clinicqueue.in',
        phone: '+919845022222',
        displayName: 'Kavitha Patil (Receptionist)',
        role: 'RECEPTIONIST',
        clinicId,
      },
      {
        id: 'user-doctor',
        email: 'doctor@clinicqueue.in',
        phone: '+919845033333',
        displayName: 'Dr. Ananya Rao (Doctor)',
        role: 'CLINICIAN',
        clinicId,
      },
      {
        id: 'user-patient',
        email: 'patient@clinicqueue.in',
        phone: '+919845044444',
        displayName: 'Suresh Kumar',
        role: 'PATIENT',
        clinicId,
      }
    )

    // 5. Pre-seeded Patients
    const p1Id = 'pat-suresh-kumar'
    const p2Id = 'pat-laxmi-desai'
    const p3Id = 'pat-manjunath-kamath'
    const p4Id = 'pat-fatima-begum'

    this.patients.push(
      {
        id: p1Id,
        clinicId,
        patientReference: 'CQ-2026-001',
        displayName: 'Suresh Kumar',
        phone: '+91 98450 44444',
        gender: 'Male',
        age: 48,
        address: 'Deshpande Nagar, Hubli',
        preferredLanguage: 'kn',
        whatsappConsent: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: p2Id,
        clinicId,
        patientReference: 'CQ-2026-002',
        displayName: 'Laxmi Desai',
        phone: '+91 98450 55555',
        gender: 'Female',
        age: 34,
        address: 'Keshwapur, Hubli',
        preferredLanguage: 'hi',
        whatsappConsent: true,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: p3Id,
        clinicId,
        patientReference: 'CQ-2026-003',
        displayName: 'Manjunath Kamath',
        phone: '+91 98450 66666',
        gender: 'Male',
        age: 62,
        address: 'Bengeri, Hubli',
        preferredLanguage: 'kn',
        whatsappConsent: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: p4Id,
        clinicId,
        patientReference: 'CQ-2026-004',
        displayName: 'Fatima Begum',
        phone: '+91 98450 77777',
        gender: 'Female',
        age: 29,
        address: 'Gokul Road, Hubli',
        preferredLanguage: 'en',
        whatsappConsent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )

    // 6. Pre-seeded Appointments
    const todayStr = new Date().toISOString().split('T')[0]
    this.appointments.push(
      {
        id: 'apt-001',
        clinicId,
        doctorId: doc1Id,
        patientId: p1Id,
        patientName: 'Suresh Kumar',
        patientPhone: '+91 98450 44444',
        doctorName: 'Dr. Ramesh Hegde',
        scheduledDate: todayStr,
        scheduledTime: '10:00 AM',
        status: 'CONFIRMED',
        source: 'ONLINE',
        reason: 'Type-2 Diabetes routine 3-month review and fasting blood sugar test',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'apt-002',
        clinicId,
        doctorId: doc1Id,
        patientId: p2Id,
        patientName: 'Laxmi Desai',
        patientPhone: '+91 98450 55555',
        doctorName: 'Dr. Ramesh Hegde',
        scheduledDate: todayStr,
        scheduledTime: '10:30 AM',
        status: 'CONFIRMED',
        source: 'PHONE',
        reason: 'Seasonal viral fever, joint pain, and throat infection for 3 days',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'apt-003',
        clinicId,
        doctorId: doc2Id,
        patientId: p3Id,
        patientName: 'Manjunath Kamath',
        patientPhone: '+91 98450 66666',
        doctorName: 'Dr. Ananya Rao',
        scheduledDate: todayStr,
        scheduledTime: '11:15 AM',
        status: 'REQUESTED',
        source: 'ONLINE',
        reason: 'Child immunization booster consultation',
        createdAt: new Date().toISOString(),
      }
    )

    // 7. Active Queue for Today
    const todaySession = `${clinicId}:${todayStr}:morning`
    this.sessionTokenCounters.set(todaySession, 105)

    this.queueEntries.push(
      {
        id: 'token-entry-101',
        clinicId,
        doctorId: doc1Id,
        doctorName: 'Dr. Ramesh Hegde',
        patientId: p1Id,
        patientName: 'Suresh Kumar',
        patientPhone: '+91 98450 44444',
        appointmentId: 'apt-001',
        queueSessionId: todaySession,
        tokenNumber: 101,
        status: 'IN_CONSULTATION',
        priority: 0,
        estimatedWaitMinutes: 0,
        checkedInAt: new Date(Date.now() - 25 * 60000).toISOString(),
        consultationStartedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        preferredLanguage: 'kn',
      },
      {
        id: 'token-entry-102',
        clinicId,
        doctorId: doc1Id,
        doctorName: 'Dr. Ramesh Hegde',
        patientId: p2Id,
        patientName: 'Laxmi Desai',
        patientPhone: '+91 98450 55555',
        appointmentId: 'apt-002',
        queueSessionId: todaySession,
        tokenNumber: 102,
        status: 'WAITING',
        priority: 0,
        estimatedWaitMinutes: 8,
        checkedInAt: new Date(Date.now() - 15 * 60000).toISOString(),
        preferredLanguage: 'hi',
      },
      {
        id: 'token-entry-103',
        clinicId,
        doctorId: doc1Id,
        doctorName: 'Dr. Ramesh Hegde',
        patientId: p3Id,
        patientName: 'Manjunath Kamath',
        patientPhone: '+91 98450 66666',
        queueSessionId: todaySession,
        tokenNumber: 103,
        status: 'WAITING',
        priority: 1, // Senior citizen
        estimatedWaitMinutes: 20,
        checkedInAt: new Date(Date.now() - 10 * 60000).toISOString(),
        preferredLanguage: 'kn',
      },
      {
        id: 'token-entry-104',
        clinicId,
        doctorId: doc1Id,
        doctorName: 'Dr. Ramesh Hegde',
        patientId: p4Id,
        patientName: 'Fatima Begum',
        patientPhone: '+91 98450 77777',
        queueSessionId: todaySession,
        tokenNumber: 104,
        status: 'WAITING',
        priority: 0,
        estimatedWaitMinutes: 32,
        checkedInAt: new Date(Date.now() - 2 * 60000).toISOString(),
        preferredLanguage: 'en',
      }
    )

    // 8. Completed Past Visits
    this.visits.push({
      id: 'vis-001',
      clinicId,
      patientId: p1Id,
      patientName: 'Suresh Kumar',
      doctorId: doc1Id,
      doctorName: 'Dr. Ramesh Hegde',
      visitDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      status: 'COMPLETED',
      clinicalNote: {
        id: uuidv4(),
        clinicId,
        visitId: 'vis-001',
        reasonForVisit: 'Uncontrolled blood sugar & fatigue',
        assessment: 'Type 2 Diabetes Mellitus with mild peripheral neuropathy',
        clinicalNotes: 'HbA1c 8.4%. Advised dietary control and 30 min daily brisk walking. Reduced sugar intake.',
        authorName: 'Dr. Ramesh Hegde',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      prescriptions: [
        {
          id: uuidv4(),
          medicineName: 'Tab. Metformin Hydrochloride',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: '1-0-1 (After Food)',
          duration: '30 Days',
          instructions: 'Take strictly after meals with water',
        },
        {
          id: uuidv4(),
          medicineName: 'Tab. Methylcobalamin',
          strength: '1500 mcg',
          dosage: '1 tablet',
          frequency: '0-0-1 (Night)',
          duration: '30 Days',
          instructions: 'Take after dinner',
        }
      ],
      followUp: {
        id: uuidv4(),
        clinicId,
        visitId: 'vis-001',
        patientId: p1Id,
        patientName: 'Suresh Kumar',
        scheduledDate: todayStr,
        status: 'DUE',
        notes: 'Review HbA1c and fasting blood sugar',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    })

    // 9. Pre-seeded WhatsApp Notifications
    this.notifications.push(
      {
        id: 'notif-001',
        clinicId,
        patientId: p1Id,
        patientPhone: '+91 98450 44444',
        recipientName: 'Suresh Kumar',
        channel: 'WHATSAPP',
        notificationType: 'CONFIRMATION',
        messageContent: 'Namaste Suresh ji. Your appointment at Shanti Ayush Clinic with Dr. Ramesh Hegde is confirmed for today at 10:00 AM. Token #101.',
        templateName: 'appointment_confirmation_kannada_v1',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'DELIVERED',
        providerMessageId: 'wamid.HBgLMjA2NjAwMDFFA',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif-002',
        clinicId,
        patientId: p2Id,
        patientPhone: '+91 98450 55555',
        recipientName: 'Laxmi Desai',
        channel: 'WHATSAPP',
        notificationType: 'REMINDER_24H',
        messageContent: 'Namaste Laxmi ji. Reminder: You have an appointment today at 10:30 AM with Dr. Ramesh Hegde. Current token: 101. Track live: https://clinicqueue.in/public',
        templateName: 'appointment_reminder_hindi_v1',
        scheduledAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'DELIVERED',
        providerMessageId: 'wamid.HBgLMjA2NjAwMDJFBA',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    )

    // 10. Audit Logs
    this.auditLogs.push({
      id: uuidv4(),
      clinicId,
      actor: 'Kavitha Patil (Receptionist)',
      action: 'QUEUE_TOKEN_ISSUED',
      resourceType: 'QUEUE_ENTRY',
      resourceId: 'token-entry-104',
      metadata: { tokenNumber: 104, patient: 'Fatima Begum' },
      occurredAt: new Date(Date.now() - 2 * 60000).toISOString(),
    })
  }

  // Concurrency-Safe Atomic Token Allocator
  public allocateNextToken(clinicId: string, doctorId: string, patientId: string, patientName: string, patientPhone: string, preferredLanguage: 'en' | 'hi' | 'kn' = 'en', priority: number = 0, appointmentId?: string): IQueueEntry {
    const todayStr = new Date().toISOString().split('T')[0]
    const sessionId = `${clinicId}:${todayStr}:active`

    // Atomic increment
    let currentMax = this.sessionTokenCounters.get(sessionId) || 100
    currentMax += 1
    this.sessionTokenCounters.set(sessionId, currentMax)

    const doctor = this.doctors.find(d => d.id === doctorId)
    const activeWaiting = this.queueEntries.filter(
      q => q.clinicId === clinicId && (q.status === 'WAITING' || q.status === 'IN_CONSULTATION')
    ).length

    const estimatedWait = activeWaiting * (doctor?.avgConsultationMinutes || 12)

    const entry: IQueueEntry = {
      id: `token-entry-${uuidv4().substring(0, 8)}`,
      clinicId,
      doctorId,
      doctorName: doctor?.displayName || 'Attending Doctor',
      patientId,
      patientName,
      patientPhone,
      appointmentId,
      queueSessionId: sessionId,
      tokenNumber: currentMax,
      status: 'WAITING',
      priority,
      estimatedWaitMinutes: Math.max(5, estimatedWait),
      checkedInAt: new Date().toISOString(),
      preferredLanguage,
    }

    this.queueEntries.push(entry)

    // Create Audit Log
    this.auditLogs.unshift({
      id: uuidv4(),
      clinicId,
      actor: 'System / Receptionist',
      action: 'TOKEN_ALLOCATED_ATOMIC',
      resourceType: 'QUEUE_ENTRY',
      resourceId: entry.id,
      metadata: { tokenNumber: entry.tokenNumber, patientName },
      occurredAt: new Date().toISOString(),
    })

    return entry
  }
}

export const memoryStore = new MemoryStore()
