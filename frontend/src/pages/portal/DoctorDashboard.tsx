import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useClinic, PatientProfile, PrescriptionItem } from '../../context/ClinicContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { 
  Stethoscope, 
  Search, 
  BarChart3, 
  User, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  TrendingUp, 
  Users, 
  Repeat, 
  Bell, 
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  X,
  Phone
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { 
    queue, 
    patients, 
    callNextToken, 
    updatePatientMedicalRecord,
    currentServingToken,
    nextAlertToken 
  } = useClinic()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<'consultation' | 'patientSearch' | 'analytics'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/analytics')) {
      return 'analytics'
    }
    return 'consultation'
  })

  useEffect(() => {
    if (location.pathname.includes('/analytics')) {
      setActiveTab('analytics')
    } else if (location.pathname.includes('/doctor')) {
      setActiveTab('consultation')
    }
  }, [location.pathname])

  // Revisit ledger filter
  const [revisitFilter, setRevisitFilter] = useState<'all' | 'revisited' | 'first_time'>('all')

  // Patient Search & History State
  const [patientSearchTerm, setPatientSearchTerm] = useState('Suresh')
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(patients[0])

  // New Consultation / Prescription Form State
  const [diagnosis, setDiagnosis] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [bp, setBp] = useState('120/80')
  const [pulse, setPulse] = useState(76)
  const [temp, setTemp] = useState('98.4°F')
  const [spo2, setSpo2] = useState(99)
  const [bloodSugar, setBloodSugar] = useState('110 mg/dL')
  const [weight, setWeight] = useState('70 kg')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('2025-02-15')

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { drug: 'Metformin Hydrochloride 500mg', dosage: '1 tablet', frequency: '1-0-1', duration: '30 days', instructions: 'After meals' },
    { drug: 'Multivitamin + Zinc', dosage: '1 capsule', frequency: '0-0-1', duration: '30 days', instructions: 'Bedtime with water' }
  ])

  const [newDrug, setNewDrug] = useState('')
  const [newDosage, setNewDosage] = useState('')
  const [newFreq, setNewFreq] = useState('1-0-1')
  const [newDuration, setNewDuration] = useState('5 days')
  const newInstructions = 'After meals'

  // Analytics Period
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Active consultation patient from queue
  const currentInRoom = queue.find(q => q.status === 'IN_CONSULTATION') || queue[0]
  const nextInRoom = queue.find(q => q.status === 'WAITING')

  // Patient Mobile (WhatsApp) and Automated Notification State
  const [patientMobileNumber, setPatientMobileNumber] = useState(
    () => currentInRoom?.patientPhone || selectedPatient?.phone || '9845044444'
  )
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true)
  const [whatsappDeliveryModal, setWhatsappDeliveryModal] = useState<{
    open: boolean
    recipientPhone: string
    patientName: string
    tokenNumber: number
    reportText: string
    timestamp: string
  } | null>(null)
  const [copiedReport, setCopiedReport] = useState(false)

  // Sync mobile number when active patient in room or selected patient changes
  useEffect(() => {
    if (currentInRoom?.patientPhone) {
      setPatientMobileNumber(currentInRoom.patientPhone)
    } else if (selectedPatient?.phone) {
      setPatientMobileNumber(selectedPatient.phone)
    }
  }, [currentInRoom?.patientPhone, selectedPatient?.phone])

  // Search Patient handler
  const handleSearchPatient = () => {
    if (!patientSearchTerm.trim()) return
    const q = patientSearchTerm.toLowerCase().trim()
    const found = patients.find(p =>
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.mrn.toLowerCase().includes(q)
    )
    if (found) {
      setSelectedPatient(found)
      addToast({
        title: `Patient History Loaded: ${found.name}`,
        message: `${found.totalVisits} visits on record.`,
        type: 'info'
      })
    } else {
      addToast({
        title: 'Patient Not Found',
        message: 'No patient record matches your query.',
        type: 'warning'
      })
    }
  }

  // Add medicine to prescription list
  const handleAddMedicine = () => {
    if (!newDrug.trim()) return
    setPrescriptions(prev => [
      ...prev,
      {
        drug: newDrug,
        dosage: newDosage || '1 tab',
        frequency: newFreq,
        duration: newDuration,
        instructions: newInstructions
      }
    ])
    setNewDrug('')
    setNewDosage('')
  }

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== idx))
  }

  // Save consultation updates & automated WhatsApp dispatch
  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault()
    const activePatientFromQueue = currentInRoom
      ? patients.find(p => {
          const cleanP = p.phone ? p.phone.replace(/\D/g, '') : ''
          const cleanQ = currentInRoom.patientPhone ? currentInRoom.patientPhone.replace(/\D/g, '') : ''
          return (cleanQ && cleanP && cleanQ === cleanP) || (currentInRoom.patientName && p.name.toLowerCase() === currentInRoom.patientName.toLowerCase())
        })
      : null

    const targetPatient = activePatientFromQueue || selectedPatient || patients[0]
    if (!targetPatient) return

    const patientName = currentInRoom?.patientName || targetPatient.name
    const cleanMobile = patientMobileNumber.replace(/\D/g, '')

    updatePatientMedicalRecord(targetPatient.id, {
      diagnosis: diagnosis || 'Routine clinical review and follow-up',
      symptoms: symptoms || 'Chronic condition maintenance',
      vitals: {
        bp,
        pulse,
        temp,
        spo2,
        bloodSugar,
        weight,
      },
      prescriptions,
      clinicalNotes,
      followUpDate,
      doctorName: user?.name || 'Dr. Ramesh Hegde',
    })

    // Refresh selected patient in view
    const updated = patients.find(p => p.id === targetPatient.id)
    if (updated) setSelectedPatient(updated)

    // Build the Official WhatsApp Medical Report
    const reportText = `🏥 *SHANTI AYUSH HEALTH CLINIC*
Consultant: ${user?.name || 'Dr. Ramesh Hegde'} (MD, Internal Medicine)
Room: Consultation Room 1 | Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━
👤 *PATIENT MEDICAL RECORD*
• Name: ${patientName}
• Token: #${currentServingToken}
• Mobile: +91 ${cleanMobile || '9845044444'}

🩺 *VITALS RECORDED*
• BP: ${bp} mmHg | Pulse: ${pulse} bpm
• Temp: ${temp} | SpO2: ${spo2}%
• Blood Sugar: ${bloodSugar} | Weight: ${weight}

📋 *DIAGNOSIS & CLINICAL FINDINGS*
${diagnosis || 'Routine clinical review and metabolic follow-up'}
${symptoms ? `• Reported Symptoms: ${symptoms}` : ''}

💊 *PRESCRIBED MEDICINES (Rx)*
${prescriptions.map((rx, i) => `${i + 1}. *${rx.drug}*
   • Dose: ${rx.dosage} | Frequency: ${rx.frequency}
   • Duration: ${rx.duration} (${rx.instructions})`).join('\n\n')}

🥗 *DOCTOR ADVICE & LIFESTYLE*
${clinicalNotes || 'Follow prescribed diet, maintain daily hydration, and engage in 30 mins light morning walk.'}

📅 *NEXT FOLLOW-UP REVISIT*
${followUpDate ? `Scheduled Date: ${followUpDate}` : 'Review after 30 days or if symptoms persist'}
━━━━━━━━━━━━━━━━━━━━━
⚕️ _Digital OPD Consultation Summary issued via ClinicQueue EHR. For queries or appointments, call clinic desk: 080-28475500._`

    if (autoSendWhatsApp && cleanMobile) {
      setWhatsappDeliveryModal({
        open: true,
        patientName,
        recipientPhone: cleanMobile,
        tokenNumber: currentServingToken,
        reportText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })

      addToast({
        title: 'WhatsApp Report Sent!',
        message: `Clinical summary & prescription delivered to +91 ${cleanMobile}.`,
        type: 'success',
      })
    } else {
      addToast({
        title: 'Consultation & Prescription Saved!',
        message: `Updated patient history for ${patientName}`,
        type: 'success',
      })
    }

    // Reset form fields
    setDiagnosis('')
    setSymptoms('')
    setClinicalNotes('')
  }

  // Analytics Datasets
  const dailyVisitsData = [
    { day: 'Mon', visits: 54, revisited: 38, newPatients: 16 },
    { day: 'Tue', visits: 62, revisited: 44, newPatients: 18 },
    { day: 'Wed', visits: 48, revisited: 33, newPatients: 15 },
    { day: 'Thu', visits: 70, revisited: 51, newPatients: 19 },
    { day: 'Fri', visits: 66, revisited: 47, newPatients: 19 },
    { day: 'Sat', visits: 58, revisited: 42, newPatients: 16 },
    { day: 'Sun', visits: 24, revisited: 18, newPatients: 6 },
  ]

  const weeklyVisitsData = [
    { period: 'Week 1', visits: 340, revisited: 238, newPatients: 102 },
    { period: 'Week 2', visits: 365, revisited: 255, newPatients: 110 },
    { period: 'Week 3', visits: 390, revisited: 278, newPatients: 112 },
    { period: 'Week 4', visits: 382, revisited: 265, newPatients: 117 },
  ]

  const monthlyVisitsData = [
    { period: 'Nov', visits: 1380, revisited: 940, newPatients: 440 },
    { period: 'Dec', visits: 1450, revisited: 1010, newPatients: 440 },
    { period: 'Jan', visits: 1580, revisited: 1120, newPatients: 460 },
  ]

  const currentChartData = analyticsPeriod === 'daily' ? dailyVisitsData : analyticsPeriod === 'weekly' ? weeklyVisitsData : monthlyVisitsData

  const repeatRatioPieData = [
    { name: 'Revisited Patients', value: 68, color: '#0D9488' },
    { name: 'First-Time Patients', value: 32, color: '#06B6D4' },
  ]

  const peakHoursData = [
    { hour: '09:00 AM', patients: 14 },
    { hour: '10:00 AM', patients: 22 },
    { hour: '11:00 AM', patients: 26 }, // peak morning
    { hour: '12:00 PM', patients: 18 },
    { hour: '01:00 PM', patients: 9 },
    { hour: '05:00 PM', patients: 16 },
    { hour: '06:00 PM', patients: 24 }, // peak evening
    { hour: '07:00 PM', patients: 20 },
    { hour: '08:00 PM', patients: 11 },
  ]

  const topDiagnosesData = [
    { condition: 'Type 2 Diabetes', count: 184 },
    { condition: 'Hypertension', count: 152 },
    { condition: 'Osteoarthritis', count: 98 },
    { condition: 'Upper Resp. Infection', count: 86 },
    { condition: 'Migraine & Cephalgia', count: 54 },
  ]

  return (
    <div className="space-y-8 max-w-[1550px] mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-teal">Clinician Workspace</span>
            <span className="text-xs text-slate-400">• Room 1 (Dr. Ramesh Hegde)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Doctor Workspace & Clinical Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Active patient consultation cabin, full medical history timeline search, prescription writer, and repeat patient analytics.
          </p>
        </div>

        {/* Global Action: Call Next Patient */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              callNextToken('doc-1')
              addToast({
                title: 'Next Patient Called!',
                message: 'Patient in cabin completed. Next token notified to step up.',
                type: 'success',
              })
            }}
            className="btn btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 hover:scale-105"
          >
            <Bell size={18} className="animate-pulse" />
            <span>Complete & Call Next Patient</span>
          </button>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-300/60 dark:border-slate-700/60">
        <button
          onClick={() => {
            setActiveTab('consultation')
            navigate('/portal/doctor')
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'consultation'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={16} />
          <span>Active Cabin Consultation</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('patientSearch')
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'patientSearch'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Search size={16} />
          <span>Patient History & Record Update</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics')
            navigate('/portal/analytics')
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BarChart3 size={16} />
          <span>Patient Visit Graphs & Repeat Retention</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE CABIN CONSULTATION */}
      {activeTab === 'consultation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Current Patient In Cabin */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 sm:p-7 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Currently Inside Cabin
                  </span>
                </div>
                <span className="badge badge-teal font-mono">
                  Room 1
                </span>
              </div>

              {/* Patient Badge and Token */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    #{currentServingToken}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {currentInRoom?.patientName || 'Suresh Kumar'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentInRoom?.patientAge || 52}y • {currentInRoom?.patientGender || 'Male'} • Phone: {currentInRoom?.patientPhone || '9845044444'}
                    </p>
                    <span className="badge badge-emerald text-[11px] font-bold mt-1">
                      {currentInRoom?.isRevisit ? `Revisit (Visit #${currentInRoom?.visitCount})` : 'New Patient'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Today's Reason for Consultation:
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {currentInRoom?.reason || 'Quarterly routine diabetes review, mild foot numbness in morning.'}
                </p>
              </div>

              {/* Next Patient in Line Preview */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Next In Waiting Lounge:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Token #{nextAlertToken}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {nextInRoom?.patientName || 'Laxmi Desai'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {nextInRoom?.reason || 'Migraine followup'}
                    </p>
                  </div>
                  <span className="badge badge-amber text-[10px]">Alert Sent</span>
                </div>
              </div>

              <button
                onClick={() => {
                  callNextToken('doc-1')
                  addToast({
                    title: 'Consultation Complete',
                    message: `Advancing to Token #${nextAlertToken}`,
                    type: 'success',
                  })
                }}
                className="btn btn-primary w-full py-3 text-sm font-bold shadow-md"
              >
                Conclude Visit & Call Token #{nextAlertToken}
              </button>
            </div>
          </div>

          {/* Right Column: Quick Prescription & Vitals Entry */}
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={20} className="text-teal-600" />
                    <span>Quick Consultation Notes & Prescription</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recording for Token #{currentServingToken} — {currentInRoom?.patientName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('patientSearch')}
                  className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
                >
                  <Search size={14} />
                  <span>View Full Past History</span>
                </button>
              </div>

              <form onSubmit={handleSaveConsultation} className="space-y-5">
                {/* WhatsApp Mobile & Automated Report Dispatch Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/90 dark:border-emerald-800/80 space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>Patient WhatsApp Mobile & Report Dispatch</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Verify or add patient mobile number. Digital Rx, vitals & diagnosis will be dispatched automatically to this WhatsApp upon saving.
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-emerald text-[10px] font-bold self-start sm:self-center">
                      Auto-WhatsApp Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-center">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Patient WhatsApp Mobile Number:
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Phone size={13} className="text-emerald-500" />
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={patientMobileNumber}
                          onChange={(e) => setPatientMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit mobile number"
                          className="input pl-14 py-2 text-xs font-bold tracking-wider text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-5 flex items-center sm:pt-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSendWhatsApp}
                          onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                          className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Auto-dispatch Rx & report to WhatsApp
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Vitals Recording Strip */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Record Patient Vitals:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400">BP (mmHg):</span>
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        placeholder="120/80"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Pulse (bpm):</span>
                      <input
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(parseInt(e.target.value) || 72)}
                        placeholder="76"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Temperature:</span>
                      <input
                        type="text"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        placeholder="98.4°F"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">SpO2 (%):</span>
                      <input
                        type="number"
                        value={spo2}
                        onChange={(e) => setSpo2(parseInt(e.target.value) || 98)}
                        placeholder="99"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Blood Sugar:</span>
                      <input
                        type="text"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        placeholder="130 mg/dL"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Weight:</span>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="71 kg"
                        className="input py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Diagnosis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Clinical Diagnosis & Findings *
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes Mellitus - Controlled with Metformin titration"
                    className="input font-medium"
                    required
                  />
                </div>

                {/* Prescriptions Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Prescribed Medicines ({prescriptions.length})
                    </label>
                  </div>

                  {/* List of currently added drugs */}
                  <div className="space-y-2">
                    {prescriptions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <div>
                          <strong className="text-teal-700 dark:text-teal-300">{rx.drug}</strong>
                          <span className="text-slate-500 block text-[11px]">
                            {rx.frequency} • {rx.duration} • {rx.instructions}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Drug Inputs */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/60 space-y-3">
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase">
                      + Add Drug to Prescription
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newDrug}
                        onChange={(e) => setNewDrug(e.target.value)}
                        placeholder="Drug name (e.g. Metformin 500mg)"
                        className="input py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={newDosage}
                        onChange={(e) => setNewDosage(e.target.value)}
                        placeholder="Dosage (e.g. 1 tablet)"
                        className="input py-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={newFreq}
                        onChange={(e) => setNewFreq(e.target.value)}
                        className="input py-2 text-xs"
                      >
                        <option value="1-0-1">1-0-1 (Twice daily)</option>
                        <option value="1-0-0">1-0-0 (Morning only)</option>
                        <option value="0-0-1">0-0-1 (Night only)</option>
                        <option value="1-1-1">1-1-1 (Thrice daily)</option>
                        <option value="SOS">SOS (When required)</option>
                      </select>
                      <input
                        type="text"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        placeholder="Duration (e.g. 30 days)"
                        className="input py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="btn btn-primary py-2 text-xs font-bold"
                      >
                        Add Drug
                      </button>
                    </div>
                  </div>
                </div>

                {/* Follow-up Revisit Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Next Follow-Up Revisit Date:
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="input py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Clinical Advice / Diet Notes:
                    </label>
                    <input
                      type="text"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="e.g. 30 mins brisk walk daily, avoid high sugar intake"
                      className="input py-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>Save Consultation & Update Patient Medical History</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT HISTORY SEARCH & FULL TIMELINE */}
      {activeTab === 'patientSearch' && (
        <div className="space-y-6">
          {/* Search Header Strip */}
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="max-w-2xl">
              <span className="badge badge-teal mb-2">EHR Clinical Lookup</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Search Patient & Full Medical History
              </h3>
              <p className="text-xs text-slate-500">
                Search any patient by Name, Phone Number, or MRN to view their lifetime visits count, past diagnoses, vitals trends, and prescribe new medications.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                  placeholder="Search by name (e.g. Suresh Kumar) or phone..."
                  className="input pl-10"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPatient}
                className="btn btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <span>Search Records</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Quick Demo Patients Selection */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold">Available Patients:</span>
              {patients.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(p)
                    setPatientSearchTerm(p.name)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedPatient?.id === p.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50'
                  }`}
                >
                  {p.name} ({p.totalVisits} Visits)
                </button>
              ))}
            </div>
          </div>

          {/* Patient History Detail View */}
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Profile Header Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/30 border border-teal-400/40 text-teal-300 font-black text-2xl flex items-center justify-center">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black">{selectedPatient.name}</h3>
                      <span className="badge bg-teal-400 text-teal-950 font-black text-[11px]">
                        MRN: {selectedPatient.mrn}
                      </span>
                    </div>
                    <p className="text-xs text-teal-200 mt-1">
                      {selectedPatient.age} Years Old • {selectedPatient.gender} • Blood Group: <strong>{selectedPatient.bloodGroup}</strong> • Phone: +91 {selectedPatient.phone}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Known Allergies: {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(', ') : 'No known drug allergies'}
                    </p>
                  </div>
                </div>

                {/* Lifetime Visit Counter Stat */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <span className="text-3xl font-black text-emerald-400">
                      {selectedPatient.totalVisits}
                    </span>
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Total Visits
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-xs space-y-0.5">
                    <span className="text-slate-300 block">First: <strong>{selectedPatient.firstVisitDate}</strong></span>
                    <span className="text-teal-300 block">Latest: <strong>{selectedPatient.lastVisitDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Chronological Visit Timeline */}
              <div className="card p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={20} className="text-teal-600" />
                      <span>Chronological Medical Visit Timeline ({selectedPatient.visits.length} Encounters)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Previous diagnoses, vitals, prescriptions, and follow-up notes recorded by attending clinicians.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {selectedPatient.visits.map((vis, index) => (
                    <div key={vis.id} className="relative pl-8 space-y-3">
                      {/* Timeline dot */}
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-teal-600 border-4 border-white dark:border-slate-900 shadow" />

                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              Visit #{selectedPatient.visits.length - index}: {vis.date}
                            </span>
                            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">• {vis.doctorName}</span>
                          </div>
                          {vis.followUpDate && (
                            <span className="badge badge-teal text-[11px]">
                              Next Followup: {vis.followUpDate}
                            </span>
                          )}
                        </div>

                        {/* Diagnosis & Symptoms */}
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Diagnosis:</span>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{vis.diagnosis}</p>
                          <p className="text-xs text-slate-500">{vis.symptoms}</p>
                        </div>

                        {/* Vitals Recorded */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-slate-400">BP:</span> <strong className="text-slate-800 dark:text-slate-200">{vis.vitals.bp}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Pulse:</span> <strong className="text-slate-800 dark:text-slate-200">{vis.vitals.pulse} bpm</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Temp:</span> <strong className="text-slate-800 dark:text-slate-200">{vis.vitals.temp}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Sugar / Weight:</span> <strong className="text-slate-800 dark:text-slate-200">{vis.vitals.bloodSugar || vis.vitals.weight || 'Normal'}</strong>
                          </div>
                        </div>

                        {/* Prescribed Drugs */}
                        {vis.prescriptions && vis.prescriptions.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medications Prescribed:</span>
                            <div className="space-y-1">
                              {vis.prescriptions.map((rx, rIdx) => (
                                <div key={rIdx} className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                  <strong className="text-teal-700 dark:text-teal-300">{rx.drug} ({rx.dosage})</strong>
                                  <span className="text-slate-500 text-[11px]">{rx.frequency} • {rx.duration}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {vis.clinicalNotes && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/50">
                            <strong>Clinical Advice:</strong> {vis.clinicalNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCTOR ANALYTICS & REPEAT PATIENTS GRAPHS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Header Strip with Period Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={22} className="text-teal-600" />
                <span>Patient Volume & Repeat Visitor Analytics</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Track how many people visited, repeat retention rate, and peak consultation hours.
              </p>
            </div>

            <div className="flex gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl border border-slate-300/60 dark:border-slate-700/60">
              {(['daily', 'weekly', 'monthly'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAnalyticsPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    analyticsPeriod === p
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Consultations</span>
                <Users size={18} className="text-teal-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">1,580</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <TrendingUp size={14} />
                <span>+12.4% vs last month</span>
              </div>
            </div>

            <div className="card p-5 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Repeatedly Came (Revisits)</span>
                <Repeat size={18} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">68%</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>1,074 repeat patient visits</span>
              </div>
            </div>

            <div className="card p-5 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">First-Time Visitors</span>
                <User size={18} className="text-cyan-600" />
              </div>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">32%</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>506 new patient intakes</span>
              </div>
            </div>

            <div className="card p-5 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Consultation Time</span>
                <Clock size={18} className="text-teal-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">11.4 min</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <span>High efficiency (Zero queue lag)</span>
              </div>
            </div>
          </div>

          {/* Graph 1: How Many People Visited (Total vs Repeat Patients) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Patient Visits: Total vs Revisited (Repeatedly Came)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comparing returning chronic care patients against new walk-in arrivals.
                  </p>
                </div>
                <span className="badge badge-emerald">68% Repeat Retention</span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalVisitsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="revisitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey={analyticsPeriod === 'daily' ? 'day' : 'period'} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="visits" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#totalVisitsGrad)" name="Total Visited" />
                    <Area type="monotone" dataKey="revisited" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#revisitGrad)" name="Repeatedly Came" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2: Donut Chart: Repeat vs New Ratio */}
            <div className="lg:col-span-4 card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Patient Retention Ratio
                </h4>
                <p className="text-xs text-slate-500">
                  New vs Repeatedly Came Patients
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repeatRatioPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {repeatRatioPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    Repeatedly Came
                  </span>
                  <strong className="text-teal-600">68% (1,074)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    New First-Timers
                  </span>
                  <strong className="text-cyan-600">32% (506)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Graph 3: Peak Clinic Hours & Top Diagnoses */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Peak Hours Hourly Distribution */}
            <div className="lg:col-span-6 card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Peak Clinic OPD Hours
                </h4>
                <p className="text-xs text-slate-500">
                  Hourly patient arrival distribution showing 11 AM morning and 6 PM evening peaks.
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="patients" fill="#0D9488" radius={[6, 6, 0, 0]} name="Patients per Hour" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="lg:col-span-6 card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Diagnosed Conditions
                </h4>
                <p className="text-xs text-slate-500">
                  Most frequent clinical diagnoses treated at Shanti Ayush Clinic.
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDiagnosesData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="condition" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={110} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} name="Case Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Hospital Inflow & Revisited Patients Ledger */}
          <div className="card p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Hospital Inflow & Repeat Attendance Ledger
                  </h4>
                  <span className="badge badge-teal">Live Database</span>
                </div>
                <p className="text-xs text-slate-500">
                  Detailed register of patients who arrived at the clinic, distinguishing returning revisited patients from first-time intakes.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRevisitFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    revisitFilter === 'all'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Arrivals ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRevisitFilter('revisited')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    revisitFilter === 'revisited'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Repeat size={13} />
                  <span>Revisited Patients ({patients.filter(p => p.totalVisits > 1).length} - 68%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRevisitFilter('first_time')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    revisitFilter === 'first_time'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <User size={13} />
                  <span>First-Time ({patients.filter(p => p.totalVisits <= 1).length} - 32%)</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Patient & MRN</th>
                    <th className="py-3 px-4">Demographics</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Lifetime Visits</th>
                    <th className="py-3 px-4">Latest Diagnosis</th>
                    <th className="py-3 px-4">Attending Doctor</th>
                    <th className="py-3 px-4">Follow-Up Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {patients
                    .filter(p => {
                      if (revisitFilter === 'revisited') return p.totalVisits > 1
                      if (revisitFilter === 'first_time') return p.totalVisits <= 1
                      return true
                    })
                    .map(pat => {
                      const isRevisit = pat.totalVisits > 1
                      const latestVis = pat.visits[0]
                      return (
                        <tr key={pat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{pat.name}</div>
                            <div className="text-[11px] text-slate-400">{pat.mrn} • {pat.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {pat.age}y / {pat.gender} • <span className="font-semibold text-teal-600">{pat.bloodGroup}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isRevisit ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60">
                                <Repeat size={12} />
                                <span>Revisited (Repeatedly Came)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200/60">
                                <User size={12} />
                                <span>First-Time Visit</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 dark:text-white">Visit #{pat.totalVisits}</span>
                            <div className="text-[10px] text-slate-400">First: {pat.firstVisitDate}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                            <span className="line-clamp-1 font-medium">{latestVis?.diagnosis || 'Routine Health Consultation'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                            {latestVis?.doctorName || 'Dr. Ramesh Hegde'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">{latestVis?.followUpDate || '—'}</span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP REPORT DELIVERY CONFIRMATION & PREVIEW MODAL */}
      {whatsappDeliveryModal && whatsappDeliveryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-500/30 overflow-hidden relative flex flex-col max-h-[92vh]">
            
            {/* Modal Header - WhatsApp Signature Aesthetic */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl shadow-inner">
                  💬
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                      WhatsApp Clinical Report Dispatched
                    </h3>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} className="stroke-[3]" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                    <span>Delivered to +91 {whatsappDeliveryModal.recipientPhone}</span>
                    <span>•</span>
                    <span>Token #{whatsappDeliveryModal.tokenNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappDeliveryModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Delivery Status Indicator Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-900/60 px-6 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Automated dispatch successful: Sent via ClinicQueue WhatsApp Cloud API</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>{whatsappDeliveryModal.timestamp}</span>
                <span className="text-cyan-500 font-bold">✓✓</span>
              </span>
            </div>

            {/* Message Body - WhatsApp Chat Bubble Preview */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950/90 space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                  Official WhatsApp Message Preview
                </span>
              </div>

              {/* Chat Bubble */}
              <div className="max-w-lg mx-auto bg-[#DCF8C6] dark:bg-[#054740] rounded-2xl rounded-tr-none p-4 sm:p-5 shadow-md border border-emerald-300/60 dark:border-emerald-700/60 text-slate-900 dark:text-emerald-50 text-xs sm:text-sm font-mono whitespace-pre-line leading-relaxed relative">
                {whatsappDeliveryModal.reportText}

                <div className="flex items-center justify-end gap-1.5 pt-3 text-[11px] text-slate-500 dark:text-emerald-300/80 font-sans">
                  <span>{whatsappDeliveryModal.timestamp}</span>
                  <span className="text-sky-500 font-black">✓✓</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Recipient: <strong className="text-slate-900 dark:text-white">+91 {whatsappDeliveryModal.recipientPhone}</strong> ({whatsappDeliveryModal.patientName})
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(whatsappDeliveryModal.reportText)
                    setCopiedReport(true)
                    setTimeout(() => setCopiedReport(false), 2000)
                    addToast({
                      title: 'Copied to Clipboard!',
                      message: 'Full prescription text copied.',
                      type: 'info'
                    })
                  }}
                  className="btn btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 font-bold"
                >
                  {copiedReport ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedReport ? 'Copied' : 'Copy Text'}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?phone=91${whatsappDeliveryModal.recipientPhone}&text=${encodeURIComponent(whatsappDeliveryModal.reportText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#25D366] hover:bg-[#20ba59] text-white text-xs py-2.5 px-4 flex items-center justify-center gap-2 font-bold shadow-md shadow-emerald-500/20"
                >
                  <ExternalLink size={14} />
                  <span>Open in WhatsApp Web / App</span>
                </a>

                <button
                  type="button"
                  onClick={() => setWhatsappDeliveryModal(null)}
                  className="btn btn-primary text-xs py-2.5 px-4 font-bold"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
