import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClinic, Doctor } from '../../context/ClinicContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { 
  QrCode, 
  Stethoscope, 
  CheckCircle2, 
  FileText, 
  User, 
  Sparkles, 
  Camera, 
  X,
  Bell
} from 'lucide-react'
import DoctorAvatar from '../../components/brand/DoctorAvatar'

export default function PatientDashboard() {
  const { user } = useAuth()
  const { 
    doctors, 
    queue, 
    checkInPatient, 
    bookNewAppointment, 
    patients, 
    currentServingToken, 
    nextAlertToken 
  } = useClinic()
  const { addToast } = useToast()

  // State for Scanner Modal
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedClinic, setScannedClinic] = useState<any>(null)

  // Booking / Token Modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingMode, setBookingMode] = useState<'walkin' | 'scheduled'>('walkin')
  const [bookingSlot, setBookingSlot] = useState('11:30 AM')
  const [reason, setReason] = useState('')
  const [userToken, setUserToken] = useState<number | null>(() => {
    // Check if user has an active token in the queue
    const found = queue.find(q => q.patientPhone === user?.phone || q.patientName.toLowerCase().includes('suresh'))
    return found ? found.tokenNumber : 103
  })

  // Patient profile & medical history
  const patientProfile = patients.find(p => p.phone === user?.phone || p.name.toLowerCase().includes('suresh')) || patients[0]

  // Find user's active queue item
  const myQueueItem = queue.find(q => q.tokenNumber === userToken)
  const isMyTurnNext = userToken !== null && nextAlertToken === userToken
  const isMyTurnNow = userToken !== null && currentServingToken === userToken

  // Available slots for scheduled booking
  const availableSlots = ['10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '05:30 PM', '06:00 PM', '06:30 PM']

  const handleStartScan = () => {
    setShowScannerModal(true)
    setIsScanning(true)
    // Simulate camera scan detection after 1.8 seconds
    setTimeout(() => {
      setIsScanning(false)
      setScannedClinic({
        name: 'Shanti Ayush Health Clinic',
        branch: 'Vidyanagar OPD Desk #4',
        verified: true,
        timestamp: new Date().toLocaleTimeString(),
      })
      addToast({
        title: 'QR Code Verified!',
        message: 'Shanti Ayush Clinic Desk #4 recognized. Doctors roster synced.',
        type: 'success',
      })
    }, 1800)
  }

  const handleConfirmToken = (doc: Doctor) => {
    if (bookingMode === 'walkin') {
      const entry = checkInPatient({
        patientName: user?.name || 'Suresh Kumar',
        patientPhone: user?.phone || '9845044444',
        patientAge: 52,
        patientGender: 'Male',
        doctorId: doc.id,
        reason: reason || 'General consultation & review',
        isRevisit: true,
      })
      setUserToken(entry.tokenNumber)
      setSelectedDoctor(null)
      setShowScannerModal(false)
      addToast({
        title: `Token #${entry.tokenNumber} Generated!`,
        message: `Your appointment with ${doc.name} has been added to the live queue.`,
        type: 'success',
      })
    } else {
      bookNewAppointment({
        patientName: user?.name || 'Suresh Kumar',
        patientPhone: user?.phone || '9845044444',
        patientAge: 52,
        patientGender: 'Male',
        doctorId: doc.id,
        doctorName: doc.name,
        date: new Date().toISOString().split('T')[0],
        timeSlot: bookingSlot,
        reason: reason || 'Scheduled review',
      })
      setSelectedDoctor(null)
      setShowScannerModal(false)
      addToast({
        title: 'Appointment Request Submitted!',
        message: `Requested ${bookingSlot} with ${doc.name}. Reception will confirm shortly.`,
        type: 'success',
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Banner / Welcome Strip */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-semibold backdrop-blur">
              <User size={14} />
              <span>Patient Self-Service Dashboard</span>
              <span>•</span>
              <span>MRN: {patientProfile.mrn}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Suresh Kumar'}
            </h1>
            <p className="text-teal-100 text-sm max-w-xl">
              Scan the clinic QR code to grab a token on arrival, view live doctor availability, and track your queue position in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartScan}
              className="btn bg-white hover:bg-teal-50 text-teal-800 px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:scale-105"
            >
              <QrCode size={18} className="text-teal-600" />
              <span>Scan Clinic QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* URGENT QUEUE ALERT BANNER IF NEXT OR IN CONSULTATION */}
      <AnimatePresence>
        {isMyTurnNow ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex items-center justify-between gap-4 border-2 border-white/40 animate-pulse-slow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                #{userToken}
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span>It's Your Turn Now! Proceed to Doctor Cabin</span>
                </h3>
                <p className="text-xs text-emerald-100">
                  Dr. Ramesh Hegde is ready for you in <strong>Consultation Room 1</strong>. Please step in.
                </p>
              </div>
            </div>
            <span className="badge bg-white text-emerald-800 font-extrabold px-3 py-1 text-xs">
              NOW SERVING
            </span>
          </motion.div>
        ) : isMyTurnNext ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl flex items-center justify-between gap-4 border-2 border-white/40"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
                <Bell size={24} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-wide flex items-center gap-2">
                  <span>🚨 Attention Token #{userToken}: You Are Next In Line!</span>
                </h3>
                <p className="text-xs text-amber-100">
                  Token #{currentServingToken} is currently inside. Please move to the consultation room door and get ready.
                </p>
              </div>
            </div>
            <span className="badge bg-white text-amber-900 font-extrabold px-3 py-1 text-xs whitespace-nowrap">
              NEXT UP
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Grid: Live Token Tracker & Active Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Queue Status Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 sm:p-7 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                  Live Queue Progress
                </span>
              </div>
              <span className="badge badge-teal">Live Sync Active</span>
            </div>

            {/* Giant Token Counter */}
            <div className="text-center py-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Assigned Token
              </p>
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white font-black text-5xl shadow-xl shadow-teal-500/25 border-4 border-white dark:border-slate-800">
                #{userToken || '—'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {myQueueItem ? myQueueItem.doctorName : 'Dr. Ramesh Hegde'}
                </h4>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  {myQueueItem ? `Consultation Room 1 • ${myQueueItem.reason}` : 'Regular checkup & diabetes follow-up'}
                </p>
              </div>
            </div>

            {/* Live Queue Comparison Grid */}
            <div className="grid grid-cols-3 gap-2.5 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Now Calling</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  #{currentServingToken}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Next In Line</span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  #{nextAlertToken}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Est. Wait</span>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {userToken && userToken > currentServingToken ? `${(userToken - currentServingToken) * 6}m` : '0m'}
                </p>
              </div>
            </div>

            {/* Visual Step Progress */}
            <div className="pt-5 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Token #{userToken} Progress</span>
                <span className="text-teal-600 dark:text-teal-400">
                  {isMyTurnNow ? 'Step 3/3 (Now in Cabin)' : isMyTurnNext ? 'Step 2/3 (Next up!)' : 'Step 1/3 (Waiting)'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  initial={{ width: '25%' }}
                  animate={{
                    width: isMyTurnNow ? '100%' : isMyTurnNext ? '75%' : '40%',
                  }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                WhatsApp SMS notification is active. You will receive an automated ping when 1 patient remains ahead.
              </p>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
              <Sparkles size={16} className="text-teal-600" />
              <span>Smart Queue Tips</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you stepped out for a tea or lab test, you will hear a chime and receive a WhatsApp alert when you are the next patient.
            </p>
          </div>
        </div>

        {/* Right Column: Available Doctors Roster */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope size={20} className="text-teal-600" />
                <span>Doctors Live Availability</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live consultation status updated directly from reception desk.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {doctors.filter(d => d.status === 'AVAILABLE').length} Available Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => {
              const isAvailable = doc.status === 'AVAILABLE'
              const isInConsultation = doc.status === 'IN_CONSULTATION'
              const isOnBreak = doc.status === 'BREAK'

              return (
                <div
                  key={doc.id}
                  className="card p-5 hover:shadow-lg hover:border-teal-500/40 transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <DoctorAvatar
                          name={doc.name}
                          specialty={doc.specialty}
                          avatarUrl={doc.avatarUrl}
                          size="md"
                          className="rounded-2xl"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            {doc.specialty}
                          </p>
                          <span className="text-[11px] text-slate-400">{doc.degrees}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`badge ${
                          isAvailable
                            ? 'badge-emerald'
                            : isInConsultation
                            ? 'badge-amber'
                            : 'badge-rose'
                        } text-[11px] font-bold`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : isInConsultation ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        {isAvailable
                          ? 'Available'
                          : isInConsultation
                          ? 'In Cabin'
                          : isOnBreak
                          ? 'On Break'
                          : 'Off Duty'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Room:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{doc.room}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Consultation Fee:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">₹{doc.fee}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Timings:</span>
                        <span className="text-slate-500 dark:text-slate-400">{doc.shifts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doc)
                        setBookingMode('walkin')
                      }}
                      disabled={!isAvailable && !isInConsultation}
                      className="btn btn-primary flex-1 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      Take Queue Token
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doc)
                        setBookingMode('scheduled')
                      }}
                      className="btn btn-secondary py-2 px-3 text-xs font-semibold"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Patient Medical History Accordion Card */}
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-teal-600" />
                  <span>My Medical History & Past Prescriptions ({patientProfile.visits.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Total Visits Recorded: <strong className="text-teal-600">{patientProfile.totalVisits} Times</strong> • Last Visited: {patientProfile.lastVisitDate}
                </p>
              </div>
              <span className="badge badge-teal">Repeat Patient</span>
            </div>

            <div className="space-y-4">
              {patientProfile.visits.map(v => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {v.doctorName}
                      </span>
                      <span className="text-[11px] text-slate-400">• {v.date}</span>
                    </div>
                    <span className="badge badge-emerald text-[11px]">Completed Visit</span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Diagnosis:</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{v.diagnosis}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.symptoms}</p>
                  </div>

                  {/* Vitals strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400">BP:</span> <strong className="text-slate-800 dark:text-slate-200">{v.vitals.bp}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Pulse:</span> <strong className="text-slate-800 dark:text-slate-200">{v.vitals.pulse} bpm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Temp:</span> <strong className="text-slate-800 dark:text-slate-200">{v.vitals.temp}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sugar:</span> <strong className="text-slate-800 dark:text-slate-200">{v.vitals.bloodSugar || 'Normal'}</strong>
                    </div>
                  </div>

                  {/* Prescribed Medications */}
                  {v.prescriptions && v.prescriptions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Prescribed Rx:</span>
                      <div className="space-y-1">
                        {v.prescriptions.map((rx, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                            <span className="font-semibold text-teal-800 dark:text-teal-300">{rx.drug}</span>
                            <span className="text-slate-500 text-[11px]">{rx.frequency} • {rx.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {v.clinicalNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/40">
                      Doctor Advice: "{v.clinicalNotes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR SCANNER SIMULATION MODAL */}
      <AnimatePresence>
        {showScannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6"
            >
              <button
                onClick={() => setShowScannerModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto mb-2">
                  <Camera size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Clinic QR Scanner
                </h3>
                <p className="text-xs text-slate-500">
                  Point camera at the QR code on the clinic desk or front door.
                </p>
              </div>

              {/* Viewfinder Window */}
              <div className="relative w-64 h-64 mx-auto rounded-3xl border-4 border-dashed border-teal-500/60 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {isScanning ? (
                  <>
                    <motion.div
                      animate={{ y: [-100, 100, -100] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399]"
                    />
                    <QrCode size={90} className="text-slate-600 animate-pulse" />
                    <span className="text-xs text-teal-400 font-semibold mt-4">Scanning QR Code...</span>
                  </>
                ) : scannedClinic ? (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-white">{scannedClinic.name}</h4>
                    <p className="text-xs text-emerald-300 font-medium">{scannedClinic.branch}</p>
                    <span className="badge badge-emerald text-[10px]">Verified Desk QR</span>
                  </div>
                ) : (
                  <QrCode size={90} className="text-slate-600" />
                )}
              </div>

              {scannedClinic ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between">
                    <span>Active Doctors Ready:</span>
                    <strong className="font-bold text-teal-600 dark:text-teal-300">
                      {doctors.filter(d => d.status === 'AVAILABLE').length} Available
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      const avail = doctors.find(d => d.status === 'AVAILABLE') || doctors[0]
                      setSelectedDoctor(avail)
                      setShowScannerModal(false)
                    }}
                    className="btn btn-primary w-full py-3 text-sm font-bold shadow-md"
                  >
                    Select Doctor & Take Token
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsScanning(true)}
                  disabled={isScanning}
                  className="btn btn-primary w-full py-3 text-sm font-bold"
                >
                  {isScanning ? 'Simulating Scanner...' : 'Rescan QR Code'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCTOR BOOKING / TOKEN CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6"
            >
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <DoctorAvatar
                  name={selectedDoctor.name}
                  specialty={selectedDoctor.specialty}
                  avatarUrl={selectedDoctor.avatarUrl}
                  size="lg"
                  className="rounded-2xl"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {selectedDoctor.specialty} • {selectedDoctor.room}
                  </p>
                  <p className="text-[11px] text-slate-400">Consultation Fee: ₹{selectedDoctor.fee}</p>
                </div>
              </div>

              {/* Booking Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBookingMode('walkin')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    bookingMode === 'walkin'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ⚡ Walk-In Queue Token
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('scheduled')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    bookingMode === 'scheduled'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📅 Book Scheduled Slot
                </button>
              </div>

              {bookingMode === 'scheduled' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Available Time Slot Today:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingSlot(slot)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                          bookingSlot === slot
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Visit / Symptoms:
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Regular diabetes checkup, joint pain..."
                  className="input"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-teal-800 dark:text-teal-300">
                  {bookingMode === 'walkin'
                    ? 'Instant Queue Entry'
                    : 'WhatsApp Confirmed Appointment'}
                </p>
                <p>
                  {bookingMode === 'walkin'
                    ? 'Your token number will be generated immediately and placed in line.'
                    : `Slot ${bookingSlot} will be requested. Reception will confirm within 5 mins.`}
                </p>
              </div>

              <button
                onClick={() => handleConfirmToken(selectedDoctor)}
                className="btn btn-primary w-full py-3 text-sm font-bold shadow-lg"
              >
                {bookingMode === 'walkin'
                  ? 'Confirm & Generate Queue Token'
                  : 'Submit Appointment Booking'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
