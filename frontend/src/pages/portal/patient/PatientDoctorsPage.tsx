import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClinic, Doctor, sortQueueInOrder } from '../../../context/ClinicContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import DoctorAvatar from '../../../components/brand/DoctorAvatar'
import { 
  Stethoscope, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  Award, 
  Camera, 
  X, 
  ShieldCheck
} from 'lucide-react'

export default function PatientDoctorsPage() {
  const { user } = useAuth()
  const { doctors, queue, checkInPatient, bookNewAppointment } = useClinic()
  const { addToast } = useToast()

  // Specialty Filter
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')

  // Scanner modal state
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedClinic, setScannedClinic] = useState<any>(null)

  // Booking / Token Modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingMode, setBookingMode] = useState<'walkin' | 'scheduled'>('walkin')
  const [bookingSlot, setBookingSlot] = useState('11:30 AM')
  const [reason, setReason] = useState('')

  // Full Doctor Bio Modal
  const [viewDoctorBio, setViewDoctorBio] = useState<Doctor | null>(null)

  // Specialties list
  const specialties = ['all', 'Diabetology', 'Pediatrics', 'Orthopedics', 'Dermatology']

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSpecialty === 'all') return true
    return doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
  })

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
        message: 'Desk #4 recognized. Doctors roster synced.',
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
      setSelectedDoctor(null)
      setShowScannerModal(false)
      addToast({
        title: `Token #${entry.tokenNumber} Generated!`,
        message: `Your appointment with ${doc.name} has been added to the queue in proper sequence.`,
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
        message: `Requested ${bookingSlot} with ${doc.name}. Reception desk will confirm shortly.`,
        type: 'success',
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter:</span>
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {spec === 'all' ? 'All Specialists' : spec}
            </button>
          ))}
        </div>

        <button
          onClick={handleStartScan}
          className="btn bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm rounded-xl shrink-0"
        >
          <QrCode size={16} />
          <span>Scan Clinic Desk QR</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope size={22} className="text-teal-600" />
            <span>Consultant Doctors & Live Availability</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time status updated directly by reception desk. Select a doctor to take a queue token or view their full credentials.
          </p>
        </div>
        <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
          {doctors.filter(d => d.status === 'AVAILABLE').length} of {doctors.length} Doctors Available Now
        </span>
      </div>

      {/* Doctors Grid with Rich Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map(doc => {
          const isAvailable = doc.status === 'AVAILABLE'
          const isInConsultation = doc.status === 'IN_CONSULTATION'
          const isOnBreak = doc.status === 'BREAK'

          // Doctor queue stats
          const docQueue = sortQueueInOrder(queue.filter(q => q.doctorId === doc.id && (q.status === 'WAITING' || q.status === 'IN_CONSULTATION')))
          const inCabin = docQueue.find(q => q.status === 'IN_CONSULTATION')
          const waitingCount = docQueue.filter(q => q.status === 'WAITING').length

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-5"
            >
              {/* Doctor Head Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <DoctorAvatar
                      id={doc.id}
                      name={doc.name}
                      specialty={doc.specialty}
                      avatarUrl={doc.avatarUrl}
                      size="lg"
                      status={doc.status}
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {doc.name}
                        </h3>
                        <ShieldCheck size={16} className="text-teal-600" />
                      </div>
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                        {doc.specialty}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {doc.degrees}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Status Badge */}
                  <span
                    className={`badge ${
                      isAvailable
                        ? 'badge-emerald'
                        : isInConsultation
                        ? 'badge-amber'
                        : 'badge-rose'
                    } text-[11px] font-extrabold px-3 py-1 flex items-center gap-1.5 shadow-sm`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      isAvailable ? 'bg-emerald-500 animate-pulse' : isInConsultation ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {isAvailable
                      ? 'Available Now'
                      : isInConsultation
                      ? 'In Consultation'
                      : isOnBreak
                      ? 'On Break'
                      : 'Off Duty'}
                  </span>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{doc.experience}</span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Consult Fee</span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400">₹{doc.fee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ratings</span>
                    <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-1">
                      <Star size={12} fill="currentColor" />
                      <span>{doc.rating} ({doc.reviewsCount})</span>
                    </span>
                  </div>
                </div>

                {/* Cabin & Queue Live Progress */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin size={14} className="text-teal-600" />
                      <span>Cabin Location:</span>
                    </span>
                    <strong className="text-slate-900 dark:text-white font-bold">{doc.room}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock size={14} className="text-teal-600" />
                      <span>OPD Shift Timings:</span>
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{doc.shifts}</span>
                  </div>

                  {/* Live Doctor Queue Ticker */}
                  <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      <span className="text-[11px] font-bold text-teal-900 dark:text-teal-200">
                        {inCabin ? `Now in Cabin: Token #${inCabin.tokenNumber}` : `Next Token Series: #${doc.currentToken}`}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                      {waitingCount} waiting • {waitingCount * 6}m wait
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(doc)
                    setBookingMode('walkin')
                  }}
                  disabled={!isAvailable && !isInConsultation}
                  className="btn btn-primary flex-1 py-2.5 text-xs font-black shadow-sm disabled:opacity-40"
                >
                  ⚡ Take Queue Token
                </button>
                <button
                  onClick={() => {
                    setSelectedDoctor(doc)
                    setBookingMode('scheduled')
                  }}
                  className="btn btn-secondary py-2.5 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  📅 Book Slot
                </button>
                <button
                  onClick={() => setViewDoctorBio(doc)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  title="View Doctor Credentials & Bio"
                >
                  <Award size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* FULL DOCTOR BIO / CREDENTIALS MODAL */}
      <AnimatePresence>
        {viewDoctorBio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setViewDoctorBio(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <DoctorAvatar
                  id={viewDoctorBio.id}
                  name={viewDoctorBio.name}
                  specialty={viewDoctorBio.specialty}
                  avatarUrl={viewDoctorBio.avatarUrl}
                  size="lg"
                  status={viewDoctorBio.status}
                />
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {viewDoctorBio.name}
                  </h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    {viewDoctorBio.specialty}
                  </p>
                  <p className="text-xs text-slate-400">{viewDoctorBio.degrees}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-teal text-[10px]">{viewDoctorBio.experience}</span>
                    <span className="badge badge-amber text-[10px] flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> {viewDoctorBio.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Clinical Expertise & Specialization:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(viewDoctorBio.specialty.includes('Diabetologist') 
                    ? ['Type-2 Diabetes Management', 'HbA1c Titration', 'Cardiometabolic Risk', 'Geriatric Health', 'Hypertension']
                    : viewDoctorBio.specialty.includes('Pediatric')
                    ? ['Child Growth Milestones', 'Vaccination Schedule', 'Pediatric Asthma', 'Neonatal Nutrition']
                    : viewDoctorBio.specialty.includes('Ortho')
                    ? ['Knee Osteoarthritis', 'Arthroscopy', 'Sports Injury', 'Spine Rehabilitation']
                    : ['Clinical Dermatology', 'Allergic Eczema', 'Psoriasis Care', 'Skin Biopsy']
                  ).map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200/50 dark:border-teal-800 font-semibold text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Consultation Cabin:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewDoctorBio.room}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Languages Spoken:</span>
                    <strong className="text-slate-800 dark:text-slate-200">English, Kannada, Hindi</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Regular Consultation Fee:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-bold">₹{viewDoctorBio.fee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">OPD Shift Hours:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewDoctorBio.shifts}</strong>
                  </div>
                </div>

                <p className="italic text-slate-500">
                  Dr. {viewDoctorBio.name.split(' ')[1]} is a certified clinician registered with Karnataka Medical Council (KMC) with over 15 years of dedicated inpatient and outpatient care.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(viewDoctorBio)
                    setViewDoctorBio(null)
                    setBookingMode('walkin')
                  }}
                  className="btn btn-primary flex-1 py-3 text-xs font-black shadow-md"
                >
                  ⚡ Take Token with Dr. {viewDoctorBio.name.split(' ')[1]}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Clinic Desk QR Scanner
                </h3>
                <p className="text-xs text-slate-500">
                  Aim your smartphone camera at the desk QR code to automatically check in and grab a sequential token.
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
                    <span className="text-xs text-teal-400 font-semibold mt-4">Scanning Desk QR Code...</span>
                  </>
                ) : scannedClinic ? (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-white">{scannedClinic.name}</h4>
                    <p className="text-xs text-emerald-300 font-medium">{scannedClinic.branch}</p>
                    <span className="badge badge-emerald text-[10px]">Desk Verified</span>
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
                  id={selectedDoctor.id}
                  name={selectedDoctor.name}
                  specialty={selectedDoctor.specialty}
                  avatarUrl={selectedDoctor.avatarUrl}
                  size="md"
                  status={selectedDoctor.status}
                />
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
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
                  Reason for Consultation / Symptoms:
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Regular diabetes follow-up, knee pain..."
                  className="input"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-teal-800 dark:text-teal-300">
                  {bookingMode === 'walkin'
                    ? 'Strict Sequential Queue Number'
                    : 'WhatsApp Confirmed Appointment'}
                </p>
                <p>
                  {bookingMode === 'walkin'
                    ? `Your token will be generated sequentially in ${selectedDoctor.name}'s series and automatically placed in live queue order.`
                    : `Slot ${bookingSlot} will be requested. Reception will confirm within 5 mins.`}
                </p>
              </div>

              <button
                onClick={() => handleConfirmToken(selectedDoctor)}
                className="btn btn-primary w-full py-3 text-sm font-bold shadow-lg"
              >
                {bookingMode === 'walkin'
                  ? 'Confirm & Issue Next Sequential Token'
                  : 'Submit Appointment Request'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
