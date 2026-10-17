import React, { createContext, useContext, useState, useEffect } from 'react'

export type DoctorStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'BREAK' | 'OFF_DUTY'
export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED'
export type AppointmentStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface Doctor {
  id: string
  name: string
  specialty: string
  degrees: string
  experience: string
  room: string
  status: DoctorStatus
  currentToken: number
  fee: number
  shifts: string
  rating: number
  reviewsCount: number
  avatarUrl: string
}

export interface QueueEntry {
  id: string
  tokenNumber: number
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: 'Male' | 'Female' | 'Other'
  doctorId: string
  doctorName: string
  status: QueueStatus
  reason: string
  isRevisit: boolean
  visitCount: number
  waitTimeStart: string
  estimatedWaitMinutes: number
  appointmentId?: string
}

export interface AppointmentRequest {
  id: string
  bookingId: string
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: 'Male' | 'Female' | 'Other'
  doctorId: string
  doctorName: string
  date: string
  timeSlot: string
  reason: string
  status: AppointmentStatus
  assignedToken?: number
  createdAt: string
}

export interface PrescriptionItem {
  drug: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface VisitHistoryRecord {
  id: string
  date: string
  doctorName: string
  symptoms: string
  diagnosis: string
  vitals: {
    bp: string
    pulse: number
    temp: string
    spo2: number
    bloodSugar?: string
    weight?: string
  }
  prescriptions: PrescriptionItem[]
  clinicalNotes: string
  followUpDate?: string
}

export interface PatientProfile {
  id: string
  mrn: string
  name: string
  phone: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  bloodGroup: string
  allergies: string[]
  totalVisits: number
  firstVisitDate: string
  lastVisitDate: string
  visits: VisitHistoryRecord[]
}

export interface LiveAlert {
  id: string
  type: 'TOKEN_CALLED' | 'NEXT_IN_LINE' | 'DOCTOR_STATUS_CHANGED' | 'APPOINTMENT_ACCEPTED'
  title: string
  message: string
  tokenNumber?: number
  doctorName?: string
  room?: string
  timestamp: string
}

interface ClinicContextType {
  doctors: Doctor[]
  queue: QueueEntry[]
  appointments: AppointmentRequest[]
  patients: PatientProfile[]
  activeAlert: LiveAlert | null
  currentServingToken: number
  nextAlertToken: number
  callNextToken: (doctorId?: string) => void
  updateDoctorStatus: (doctorId: string, status: DoctorStatus, room?: string) => void
  acceptAppointment: (appointmentId: string) => void
  rejectAppointment: (appointmentId: string) => void
  bookNewAppointment: (data: Omit<AppointmentRequest, 'id' | 'bookingId' | 'status' | 'createdAt'>) => AppointmentRequest
  checkInPatient: (data: {
    patientName: string
    patientPhone: string
    patientAge: number
    patientGender: 'Male' | 'Female' | 'Other'
    doctorId: string
    reason: string
    isRevisit?: boolean
  }) => QueueEntry
  checkInRevisitedPatient: (patientId: string, chiefComplaint: string, doctorId: string) => QueueEntry | null
  updatePatientMedicalRecord: (
    patientId: string,
    visitData: {
      diagnosis: string
      symptoms: string
      vitals: { bp: string; pulse: number; temp: string; spo2: number; bloodSugar?: string; weight?: string }
      prescriptions: PrescriptionItem[]
      clinicalNotes: string
      followUpDate?: string
      doctorName?: string
    }
  ) => void
  dismissAlert: () => void
  scanClinicQR: () => { clinicName: string; location: string; availableDoctors: Doctor[] }
}

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ramesh Hegde',
    specialty: 'Senior Physician & Diabetologist',
    degrees: 'MBBS, MD (Internal Medicine)',
    experience: '18+ Years Experience',
    room: 'Consultation Room 1',
    status: 'AVAILABLE',
    currentToken: 101,
    fee: 350,
    shifts: '09:00 AM - 01:30 PM | 05:00 PM - 09:00 PM',
    rating: 4.9,
    reviewsCount: 428,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Rao',
    specialty: 'Consultant Pediatrician & Child Health',
    degrees: 'MBBS, DCH (Pediatrics)',
    experience: '12+ Years Experience',
    room: 'Consultation Room 2',
    status: 'AVAILABLE',
    currentToken: 201,
    fee: 400,
    shifts: '10:00 AM - 02:00 PM',
    rating: 4.95,
    reviewsCount: 312,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813511-37d457fd691f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajesh Sharma',
    specialty: 'Orthopedic & Joint Care Specialist',
    degrees: 'MBBS, MS (Ortho), Fellowship Arthroscopy',
    experience: '15+ Years Experience',
    room: 'Consultation Room 3',
    status: 'IN_CONSULTATION',
    currentToken: 301,
    fee: 450,
    shifts: '04:00 PM - 08:30 PM',
    rating: 4.88,
    reviewsCount: 254,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Sneha Patil',
    specialty: 'Dermatology & Skin Care',
    degrees: 'MBBS, MD (Dermatology)',
    experience: '9+ Years Experience',
    room: 'Consultation Room 4',
    status: 'BREAK',
    currentToken: 401,
    fee: 400,
    shifts: '02:00 PM - 06:00 PM',
    rating: 4.85,
    reviewsCount: 180,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
  },
]

const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'pat-1',
    mrn: 'MRN-8492',
    name: 'Suresh Kumar',
    phone: '9845044444',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    totalVisits: 5,
    firstVisitDate: '2024-05-12',
    lastVisitDate: '2025-01-10',
    visits: [
      {
        id: 'vis-101',
        date: '2025-01-10',
        doctorName: 'Dr. Ramesh Hegde',
        symptoms: 'Quarterly routine diabetes review, mild foot numbness in the morning.',
        diagnosis: 'Type 2 Diabetes Mellitus with early peripheral sensory neuropathy (controlled).',
        vitals: { bp: '128/82', pulse: 74, temp: '98.4°F', spo2: 98, bloodSugar: '138 mg/dL (PP)', weight: '71 kg' },
        prescriptions: [
          { drug: 'Metformin Hydrochloride 500mg', dosage: '1 tablet', frequency: '1-0-1 (After meals)', duration: '90 days', instructions: 'Take twice daily after food' },
          { drug: 'Glimepiride 1mg', dosage: '1 tablet', frequency: '1-0-0 (Before breakfast)', duration: '90 days', instructions: 'Take 15 mins before breakfast' },
          { drug: 'Methylcobalamin + Alpha Lipoic Acid', dosage: '1 capsule', frequency: '0-0-1 (At night)', duration: '30 days', instructions: 'For nerve tingling sensation' },
        ],
        clinicalNotes: 'HbA1c reduced to 6.8% from 7.4%. Advised 30 mins brisk walking daily and reduction in evening rice intake.',
        followUpDate: '2025-04-10',
      },
      {
        id: 'vis-102',
        date: '2024-10-04',
        doctorName: 'Dr. Ramesh Hegde',
        symptoms: 'Follow-up consultation, mild daytime fatigue.',
        diagnosis: 'Type 2 Diabetes Mellitus under titration.',
        vitals: { bp: '132/86', pulse: 78, temp: '98.6°F', spo2: 97, bloodSugar: '154 mg/dL (PP)', weight: '72.5 kg' },
        prescriptions: [
          { drug: 'Metformin Hydrochloride 500mg', dosage: '1 tablet', frequency: '1-0-1', duration: '60 days', instructions: 'Twice daily' },
        ],
        clinicalNotes: 'Titrated dosage. Renal function tests normal.',
        followUpDate: '2025-01-10',
      },
      {
        id: 'vis-103',
        date: '2024-05-12',
        doctorName: 'Dr. Ramesh Hegde',
        symptoms: 'Polydipsia, polyuria, unexplained weight loss 3kg.',
        diagnosis: 'Newly detected Type 2 Diabetes Mellitus.',
        vitals: { bp: '136/88', pulse: 82, temp: '98.6°F', spo2: 98, bloodSugar: '210 mg/dL (Random)', weight: '74 kg' },
        prescriptions: [
          { drug: 'Metformin Hydrochloride 500mg', dosage: '1 tablet', frequency: '0-0-1', duration: '14 days', instructions: 'With dinner' },
        ],
        clinicalNotes: 'Initial workup done. Advised dietary counseling and baseline ophthalmology screening.',
        followUpDate: '2024-06-01',
      },
    ],
  },
  {
    id: 'pat-2',
    mrn: 'MRN-8493',
    name: 'Laxmi Desai',
    phone: '9845055555',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['None recorded'],
    totalVisits: 3,
    firstVisitDate: '2024-09-18',
    lastVisitDate: '2025-01-05',
    visits: [
      {
        id: 'vis-201',
        date: '2025-01-05',
        doctorName: 'Dr. Ramesh Hegde',
        symptoms: 'Throbbing hemicranial headache, photophobia, nausea.',
        diagnosis: 'Common Migraine flare-up triggered by work stress.',
        vitals: { bp: '118/76', pulse: 72, temp: '98.4°F', spo2: 99, weight: '58 kg' },
        prescriptions: [
          { drug: 'Naproxen Sodium 500mg', dosage: '1 tab SOS', frequency: 'When required', duration: '5 days', instructions: 'Take with glass of water' },
          { drug: 'Flunarizine 5mg', dosage: '1 tab', frequency: '0-0-1 (Bedtime)', duration: '30 days', instructions: 'Nightly prophylaxis' },
        ],
        clinicalNotes: 'Advised regular sleep schedule and hydration.',
        followUpDate: '2025-02-15',
      },
    ],
  },
  {
    id: 'pat-3',
    mrn: 'MRN-8494',
    name: 'Manjunath Kamath',
    phone: '9845066666',
    age: 64,
    gender: 'Male',
    bloodGroup: 'A+',
    allergies: ['NSAIDs causing gastritis'],
    totalVisits: 6,
    firstVisitDate: '2023-11-20',
    lastVisitDate: '2024-12-28',
    visits: [
      {
        id: 'vis-301',
        date: '2024-12-28',
        doctorName: 'Dr. Rajesh Sharma',
        symptoms: 'Bilateral knee pain, crepitus on climbing stairs.',
        diagnosis: 'Bilateral Osteoarthritis Knee Grade 2.',
        vitals: { bp: '134/84', pulse: 76, temp: '98.2°F', spo2: 97, weight: '78 kg' },
        prescriptions: [
          { drug: 'Paracetamol 650mg', dosage: '1 tab SOS', frequency: 'As needed for pain', duration: '7 days', instructions: 'Max 3 times daily' },
          { drug: 'Glucosamine + Diacerein', dosage: '1 tab', frequency: '0-1-0', duration: '60 days', instructions: 'After lunch' },
        ],
        clinicalNotes: 'Advised quadriceps strengthening exercises. Avoid prolonged floor squatting.',
        followUpDate: '2025-03-01',
      },
    ],
  },
  {
    id: 'pat-4',
    mrn: 'MRN-8495',
    name: 'Fatima Begum',
    phone: '9845077777',
    age: 29,
    gender: 'Female',
    bloodGroup: 'AB+',
    allergies: ['Dust mites'],
    totalVisits: 2,
    firstVisitDate: '2024-11-02',
    lastVisitDate: '2024-12-15',
    visits: [
      {
        id: 'vis-401',
        date: '2024-12-15',
        doctorName: 'Dr. Ramesh Hegde',
        symptoms: 'Dry cough for 5 days, mild throat irritation.',
        diagnosis: 'Acute Upper Respiratory Tract Infection (Viral).',
        vitals: { bp: '114/72', pulse: 80, temp: '99.1°F', spo2: 99, weight: '54 kg' },
        prescriptions: [
          { drug: 'Levocetirizine + Montelukast', dosage: '1 tab', frequency: '0-0-1', duration: '7 days', instructions: 'Bedtime' },
          { drug: 'Warm saline gargle', dosage: '3 times daily', frequency: 'TID', duration: '5 days', instructions: 'Warm water' },
        ],
        clinicalNotes: 'Chest clear. No wheeze.',
      },
    ],
  },
  {
    id: 'pat-5',
    mrn: 'MRN-8496',
    name: 'Aarav Patel',
    phone: '9845088888',
    age: 7,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: ['Peanuts (mild hives)'],
    totalVisits: 4,
    firstVisitDate: '2024-03-10',
    lastVisitDate: '2024-11-19',
    visits: [
      {
        id: 'vis-501',
        date: '2024-11-19',
        doctorName: 'Dr. Ananya Rao',
        symptoms: 'Routine growth milestone check and booster MMR vaccination.',
        diagnosis: 'Well child visit. Normal physical and cognitive growth.',
        vitals: { bp: '100/64', pulse: 92, temp: '98.6°F', spo2: 100, weight: '22 kg' },
        prescriptions: [
          { drug: 'Multivitamin syrup 5ml', dosage: '5ml', frequency: '1-0-0', duration: '30 days', instructions: 'After breakfast' },
        ],
        clinicalNotes: 'Vaccine administered in left deltoid. No immediate reaction observed.',
        followUpDate: '2025-05-20',
      },
    ],
  },
]

const INITIAL_QUEUE: QueueEntry[] = [
  {
    id: 'q-101',
    tokenNumber: 101,
    patientName: 'Suresh Kumar',
    patientPhone: '9845044444',
    patientAge: 52,
    patientGender: 'Male',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Hegde',
    status: 'IN_CONSULTATION',
    reason: 'Quarterly routine diabetes review',
    isRevisit: true,
    visitCount: 5,
    waitTimeStart: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedWaitMinutes: 0,
  },
  {
    id: 'q-102',
    tokenNumber: 102,
    patientName: 'Laxmi Desai',
    patientPhone: '9845055555',
    patientAge: 34,
    patientGender: 'Female',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Hegde',
    status: 'WAITING',
    reason: 'Migraine followup and sleep issue',
    isRevisit: true,
    visitCount: 3,
    waitTimeStart: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedWaitMinutes: 6,
  },
  {
    id: 'q-103',
    tokenNumber: 103,
    patientName: 'Manjunath Kamath',
    patientPhone: '9845066666',
    patientAge: 64,
    patientGender: 'Male',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Hegde',
    status: 'WAITING',
    reason: 'Joint stiffness & senior wellness checkup',
    isRevisit: true,
    visitCount: 6,
    waitTimeStart: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedWaitMinutes: 18,
  },
  {
    id: 'q-104',
    tokenNumber: 104,
    patientName: 'Fatima Begum',
    patientPhone: '9845077777',
    patientAge: 29,
    patientGender: 'Female',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Hegde',
    status: 'WAITING',
    reason: 'Seasonal viral cough and throat pain',
    isRevisit: false,
    visitCount: 1,
    waitTimeStart: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedWaitMinutes: 30,
  },
  {
    id: 'q-201',
    tokenNumber: 201,
    patientName: 'Aarav Patel',
    patientPhone: '9845088888',
    patientAge: 7,
    patientGender: 'Male',
    doctorId: 'doc-2',
    doctorName: 'Dr. Ananya Rao',
    status: 'IN_CONSULTATION',
    reason: 'Pediatric cough & growth check',
    isRevisit: true,
    visitCount: 4,
    waitTimeStart: new Date(Date.now() - 12 * 60000).toISOString(),
    estimatedWaitMinutes: 0,
  },
  {
    id: 'q-202',
    tokenNumber: 202,
    patientName: 'Rohan Deshpande',
    patientPhone: '9845334455',
    patientAge: 5,
    patientGender: 'Male',
    doctorId: 'doc-2',
    doctorName: 'Dr. Ananya Rao',
    status: 'WAITING',
    reason: 'Routine seasonal flu vaccination',
    isRevisit: false,
    visitCount: 1,
    waitTimeStart: new Date(Date.now() - 6 * 60000).toISOString(),
    estimatedWaitMinutes: 10,
  },
]

export const sortQueueInOrder = (queueList: QueueEntry[]): QueueEntry[] => {
  return [...queueList].sort((a, b) => {
    // 1. IN_CONSULTATION first
    if (a.status === 'IN_CONSULTATION' && b.status !== 'IN_CONSULTATION') return -1
    if (b.status === 'IN_CONSULTATION' && a.status !== 'IN_CONSULTATION') return 1
    // 2. WAITING second
    if (a.status === 'WAITING' && b.status !== 'WAITING') return -1
    if (b.status === 'WAITING' && a.status !== 'WAITING') return 1
    // 3. Strict sequential by tokenNumber
    return a.tokenNumber - b.tokenNumber
  })
}

const INITIAL_APPOINTMENTS: AppointmentRequest[] = [
  {
    id: 'apt-1',
    bookingId: 'APT-9102',
    patientName: 'Meera Kulkarni',
    patientPhone: '9845112233',
    patientAge: 46,
    patientGender: 'Female',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Hegde',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:30 AM',
    reason: 'Follow-up on high blood pressure medications',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: 'apt-2',
    bookingId: 'APT-9103',
    patientName: 'Vivek Joshi',
    patientPhone: '9845223344',
    patientAge: 38,
    patientGender: 'Male',
    doctorId: 'doc-3',
    doctorName: 'Dr. Rajesh Sharma',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '05:30 PM',
    reason: 'Lower back stiffness and gym injury',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'apt-3',
    bookingId: 'APT-9099',
    patientName: 'Rohan Deshpande',
    patientPhone: '9845334455',
    patientAge: 5,
    patientGender: 'Male',
    doctorId: 'doc-2',
    doctorName: 'Dr. Ananya Rao',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '12:00 PM',
    reason: 'Routine seasonal flu vaccination',
    status: 'ACCEPTED',
    assignedToken: 202,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
]

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('clinic_doctors')
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS
  })

  const [queue, setQueue] = useState<QueueEntry[]>(() => {
    const saved = localStorage.getItem('clinic_queue')
    return saved ? JSON.parse(saved) : INITIAL_QUEUE
  })

  const [appointments, setAppointments] = useState<AppointmentRequest[]>(() => {
    const saved = localStorage.getItem('clinic_appointments')
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS
  })

  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem('clinic_patients')
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS
  })

  const [activeAlert, setActiveAlert] = useState<LiveAlert | null>(null)

  useEffect(() => {
    localStorage.setItem('clinic_doctors', JSON.stringify(doctors))
  }, [doctors])

  useEffect(() => {
    localStorage.setItem('clinic_queue', JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    localStorage.setItem('clinic_patients', JSON.stringify(patients))
  }, [patients])

  // Helper to generate sequential token numbers per doctor
  const getNextTokenForDoctor = (targetDocId: string, currentQueue: QueueEntry[]): number => {
    const docTokens = currentQueue
      .filter(q => q.doctorId === targetDocId)
      .map(q => q.tokenNumber)
    const baseToken =
      targetDocId === 'doc-2' ? 200 : targetDocId === 'doc-3' ? 300 : targetDocId === 'doc-4' ? 400 : 100

    if (docTokens.length === 0) {
      return baseToken + 1
    }
    const maxToken = Math.max(...docTokens)
    return Math.max(maxToken, baseToken) + 1
  }

  // Derive current in-consultation and next token
  const inConsultationEntry = queue.find(q => q.status === 'IN_CONSULTATION')
  const currentServingToken = inConsultationEntry ? inConsultationEntry.tokenNumber : (queue[0]?.tokenNumber || 101)

  const waitingEntries = [...queue]
    .filter(q => q.status === 'WAITING')
    .sort((a, b) => a.tokenNumber - b.tokenNumber)
  const nextAlertToken = waitingEntries[0]?.tokenNumber || currentServingToken + 1

  // Receptionist / Doctor calls the next token in strict sequential order
  const callNextToken = (doctorId?: string) => {
    const targetDocId = doctorId || 'doc-1'
    const doc = doctors.find(d => d.id === targetDocId)
    const docName = doc ? doc.name : 'Dr. Ramesh Hegde'
    const room = doc ? doc.room : 'Consultation Room 1'

    setQueue(prevQueue => {
      // 1. Mark currently in-consultation patient for this doctor as COMPLETED
      let updated = prevQueue.map(item => {
        if (item.doctorId === targetDocId && item.status === 'IN_CONSULTATION') {
          return { ...item, status: 'COMPLETED' as QueueStatus }
        }
        return item
      })

      // 2. Find waiting patients for this doctor sorted strictly by tokenNumber ascending
      const waitingForDoc = updated
        .filter(item => item.doctorId === targetDocId && item.status === 'WAITING')
        .sort((a, b) => a.tokenNumber - b.tokenNumber)

      if (waitingForDoc.length > 0) {
        const nextPatient = waitingForDoc[0]
        const upNextPatient = waitingForDoc[1] // The one immediately following

        updated = updated.map(item =>
          item.id === nextPatient.id ? { ...item, status: 'IN_CONSULTATION' as QueueStatus } : item
        )

        // Update Doctor current token
        setDoctors(prevDocs =>
          prevDocs.map(d =>
            d.id === targetDocId ? { ...d, currentToken: nextPatient.tokenNumber, status: 'IN_CONSULTATION' } : d
          )
        )

        // Trigger Broadcast Alert: "Token #X called in, Alert to Token #Y: You are next!"
        const alertText = upNextPatient
          ? `Token #${nextPatient.tokenNumber} (${nextPatient.patientName}) called into ${room}. ALERT to Token #${upNextPatient.tokenNumber} (${upNextPatient.patientName}): You are next in line!`
          : `Token #${nextPatient.tokenNumber} (${nextPatient.patientName}) called into ${room}.`

        setActiveAlert({
          id: Math.random().toString(36).substring(2, 9),
          type: 'TOKEN_CALLED',
          title: `🔔 NOW SERVING: Token #${nextPatient.tokenNumber}`,
          message: alertText,
          tokenNumber: nextPatient.tokenNumber,
          doctorName: docName,
          room: room,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      } else {
        // No more waiting patients
        setActiveAlert({
          id: Math.random().toString(36).substring(2, 9),
          type: 'DOCTOR_STATUS_CHANGED',
          title: 'Queue Cleared',
          message: `All waiting patients for ${docName} have been consulted!`,
          doctorName: docName,
          room: room,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }

      return updated
    })
  }

  // Update doctor availability in real-time
  const updateDoctorStatus = (doctorId: string, status: DoctorStatus, room?: string) => {
    setDoctors(prev =>
      prev.map(d => {
        if (d.id === doctorId) {
          return {
            ...d,
            status,
            room: room || d.room,
          }
        }
        return d
      })
    )

    const doc = doctors.find(d => d.id === doctorId)
    setActiveAlert({
      id: Math.random().toString(36).substring(2, 9),
      type: 'DOCTOR_STATUS_CHANGED',
      title: `Doctor Status Updated: ${doc?.name || 'Doctor'}`,
      message: `Status is now: ${status.replace('_', ' ')}${room ? ` in ${room}` : ''}`,
      doctorName: doc?.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  // Accept appointment request
  const acceptAppointment = (appointmentId: string) => {
    const apt = appointments.find(a => a.id === appointmentId)
    if (!apt) return

    const assignedToken = getNextTokenForDoctor(apt.doctorId, queue)

    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status: 'ACCEPTED', assignedToken } : a))
    )

    // Add into active queue
    const newQueueItem: QueueEntry = {
      id: `q-${assignedToken}`,
      tokenNumber: assignedToken,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      patientAge: apt.patientAge || 35,
      patientGender: apt.patientGender || 'Male',
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      status: 'WAITING',
      reason: apt.reason,
      isRevisit: false,
      visitCount: 1,
      waitTimeStart: new Date().toISOString(),
      estimatedWaitMinutes: 24,
      appointmentId: apt.id,
    }
    setQueue(prev => [...prev, newQueueItem])

    setActiveAlert({
      id: Math.random().toString(36).substring(2, 9),
      type: 'APPOINTMENT_ACCEPTED',
      title: `Appointment Confirmed for ${apt.patientName}`,
      message: `Token #${assignedToken} assigned for ${apt.timeSlot} with ${apt.doctorName}. WhatsApp confirmation sent!`,
      tokenNumber: assignedToken,
      doctorName: apt.doctorName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  // Reject appointment request
  const rejectAppointment = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, status: 'DECLINED' } : apt))
    )
  }

  // User submits new appointment request
  const bookNewAppointment = (data: Omit<AppointmentRequest, 'id' | 'bookingId' | 'status' | 'createdAt'>) => {
    const bookingId = `APT-${Math.floor(1000 + Math.random() * 9000)}`
    const newApt: AppointmentRequest = {
      ...data,
      id: `apt-${Date.now()}`,
      bookingId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    setAppointments(prev => [newApt, ...prev])
    return newApt
  }

  // Register patient / Walk-in check-in
  const checkInPatient = (data: {
    patientName: string
    patientPhone: string
    patientAge: number
    patientGender: 'Male' | 'Female' | 'Other'
    doctorId: string
    reason: string
    isRevisit?: boolean
  }) => {
    const doc = doctors.find(d => d.id === data.doctorId) || doctors[0]
    const nextToken = getNextTokenForDoctor(data.doctorId, queue)

    const newQueueItem: QueueEntry = {
      id: `q-${nextToken}`,
      tokenNumber: nextToken,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      doctorId: data.doctorId,
      doctorName: doc.name,
      status: 'WAITING',
      reason: data.reason,
      isRevisit: data.isRevisit || false,
      visitCount: data.isRevisit ? 3 : 1,
      waitTimeStart: new Date().toISOString(),
      estimatedWaitMinutes: 20,
    }

    setQueue(prev => [...prev, newQueueItem])

    // Also link or create in patient database
    setPatients(prev => {
      const existing = prev.find(p => p.phone === data.patientPhone)
      if (existing) {
        return prev.map(p =>
          p.id === existing.id
            ? { ...p, totalVisits: p.totalVisits + 1, lastVisitDate: new Date().toISOString().split('T')[0] }
            : p
        )
      } else {
        const newProfile: PatientProfile = {
          id: `pat-${Date.now()}`,
          mrn: `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
          name: data.patientName,
          phone: data.patientPhone,
          age: data.patientAge,
          gender: data.patientGender,
          bloodGroup: 'B+',
          allergies: [],
          totalVisits: 1,
          firstVisitDate: new Date().toISOString().split('T')[0],
          lastVisitDate: new Date().toISOString().split('T')[0],
          visits: [],
        }
        return [newProfile, ...prev]
      }
    })

    return newQueueItem
  }

  // Fast check-in for returning / revisited patients
  const checkInRevisitedPatient = (patientId: string, chiefComplaint: string, doctorId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (!patient) return null

    const doc = doctors.find(d => d.id === doctorId) || doctors[0]
    const nextToken = getNextTokenForDoctor(doc.id, queue)
    const newVisitCount = patient.totalVisits + 1

    const newQueueItem: QueueEntry = {
      id: `q-${nextToken}`,
      tokenNumber: nextToken,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doc.id,
      doctorName: doc.name,
      status: 'WAITING',
      reason: chiefComplaint || 'Follow-up consultation',
      isRevisit: true,
      visitCount: newVisitCount,
      waitTimeStart: new Date().toISOString(),
      estimatedWaitMinutes: 15,
    }

    setQueue(prev => [...prev, newQueueItem])

    // Update patient profile visit counter and date
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              totalVisits: newVisitCount,
              lastVisitDate: new Date().toISOString().split('T')[0],
            }
          : p
      )
    )

    setActiveAlert({
      id: Math.random().toString(36).substring(2, 9),
      type: 'TOKEN_CALLED',
      title: `Revisited Patient Checked In: ${patient.name}`,
      message: `Token #${nextToken} issued for Visit #${newVisitCount} with ${doc.name}`,
      tokenNumber: nextToken,
      doctorName: doc.name,
      room: doc.room,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    return newQueueItem
  }

  // Doctor updates consultation, vitals, prescriptions, and diagnosis
  const updatePatientMedicalRecord = (
    patientId: string,
    visitData: {
      diagnosis: string
      symptoms: string
      vitals: { bp: string; pulse: number; temp: string; spo2: number; bloodSugar?: string; weight?: string }
      prescriptions: PrescriptionItem[]
      clinicalNotes: string
      followUpDate?: string
      doctorName?: string
    }
  ) => {
    const newVisitRecord: VisitHistoryRecord = {
      id: `vis-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      doctorName: visitData.doctorName || 'Dr. Ramesh Hegde',
      symptoms: visitData.symptoms,
      diagnosis: visitData.diagnosis,
      vitals: visitData.vitals,
      prescriptions: visitData.prescriptions,
      clinicalNotes: visitData.clinicalNotes,
      followUpDate: visitData.followUpDate,
    }

    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            lastVisitDate: newVisitRecord.date,
            visits: [newVisitRecord, ...p.visits],
          }
        }
        return p
      })
    )

    setActiveAlert({
      id: Math.random().toString(36).substring(2, 9),
      type: 'TOKEN_CALLED',
      title: 'Consultation & Prescription Saved',
      message: `Medical history updated with new Rx and diagnosis: ${visitData.diagnosis}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const dismissAlert = () => {
    setActiveAlert(null)
  }

  const scanClinicQR = () => {
    return {
      clinicName: 'Shanti Ayush Health Clinic',
      location: 'Hubli, Karnataka - OPD Desk QR #4 Verified',
      availableDoctors: doctors.filter(d => d.status === 'AVAILABLE'),
    }
  }

  const value = {
    doctors,
    queue,
    appointments,
    patients,
    activeAlert,
    currentServingToken,
    nextAlertToken,
    callNextToken,
    updateDoctorStatus,
    acceptAppointment,
    rejectAppointment,
    bookNewAppointment,
    checkInPatient,
    checkInRevisitedPatient,
    updatePatientMedicalRecord,
    dismissAlert,
    scanClinicQR,
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider')
  }
  return context
}
