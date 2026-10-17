import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useClinic } from '../../context/ClinicContext'
import { useAuth } from '../../context/AuthContext'
import DoctorAvatar from '../../components/brand/DoctorAvatar'
import { 
  Activity, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Stethoscope,
  Monitor,
  CheckCircle2,
  ChevronDown,
  Star,
  ArrowRight,
  ClipboardList,
  User,
  HeartPulse,
  Clock,
  QrCode,
  Check
} from 'lucide-react'

export default function LandingPage() {
  const { doctors, queue, currentServingToken, nextAlertToken } = useClinic()
  const { isAuthenticated } = useAuth()
  const bookingLink = isAuthenticated ? '/portal/patient' : '/login'

  const [tokenSearch, setTokenSearch] = useState('')
  const [searchedToken, setSearchedToken] = useState<any>(null)
  const [searchError, setSearchError] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)

  // Handle Token Search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchError(false)

    const cleanInput = tokenSearch.replace(/\D/g, '').trim()
    const num = parseInt(cleanInput, 10)
    if (!num) {
      setSearchError(true)
      return
    }

    const matched = queue.find(q => q.tokenNumber === num)
    if (matched) {
      setSearchedToken({
        tokenNumber: matched.tokenNumber,
        patientName: matched.patientName,
        status: matched.status,
        doctor: matched.doctorName,
        estimatedWait: matched.status === 'IN_CONSULTATION' ? '0 mins (Now Inside Cabin)' : `~${matched.estimatedWaitMinutes} mins`,
        ahead: Math.max(0, matched.tokenNumber - currentServingToken - 1),
        stage: matched.status === 'IN_CONSULTATION' ? 2 : matched.tokenNumber === nextAlertToken ? 1 : 1,
      })
    } else {
      setSearchedToken({
        tokenNumber: num,
        patientName: 'Registered Patient',
        status: num === currentServingToken ? 'IN_CONSULTATION' : 'WAITING',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: num === currentServingToken ? 'Inside Cabin' : `${Math.max(8, (num - currentServingToken) * 6)} mins`,
        ahead: Math.max(0, num - currentServingToken - 1),
        stage: num === currentServingToken ? 2 : 1,
      })
    }
  }

  const faqs = [
    {
      q: 'How does the Smart QR Scanner check-in work?',
      a: 'When you arrive at the clinic, simply open your camera or click "Scan Clinic QR" on our website. The scanner instantly verifies the clinic desk, displays all currently available doctors, and issues your live queue token directly to your phone without having to stand in a queue.'
    },
    {
      q: 'Will I get an alert when it is my turn for consultation?',
      a: 'Yes! When the receptionist calls the patient ahead of you, your screen immediately displays a prominent "You Are Next" alert banner with sound notification. You will also receive an automated WhatsApp ping so you never miss your turn even if you step outside.'
    },
    {
      q: 'How does the clinic handle repeat or revisited patients?',
      a: 'Returning patients are instantly recognized in our system by their phone number or MRN. The receptionist fast-tracks their token generation while doctors can view their complete lifetime medical history, previous prescriptions, and vitals timeline.'
    },
    {
      q: 'Can I book an appointment online before coming to the clinic?',
      a: 'Absolutely. You can select your preferred doctor, pick an open morning or evening OPD time slot, and submit a booking request. You will receive an instant WhatsApp confirmation.'
    }
  ]

  const testimonials = [
    {
      name: 'Basavaraj Hiremath',
      location: 'Hubli',
      rating: 5,
      comment: 'The QR token system is a blessing! I scanned the code at the desk, saw Dr. Ramesh was available, had a coffee nearby, and returned right when my phone alerted me that token #102 was called. Zero waiting in crowded halls.',
      role: 'Diabetes Chronic Care Patient (Visit #7)'
    },
    {
      name: 'Sunita Nayak',
      location: 'Dharwad',
      rating: 5,
      comment: 'Doctor had my entire 6-month blood pressure chart and past prescriptions open on his screen the second I walked into Room 1. The clinic is so organized and clean.',
      role: 'Hypertension Follow-Up'
    },
    {
      name: 'Praveen Shettar',
      location: 'Vidyanagar',
      rating: 5,
      comment: 'Took my 4-year-old son to Dr. Ananya. We checked her availability online first and walked in on time for his vaccination. Beautiful website and very smooth process.',
      role: 'Parent of Pediatric Patient'
    }
  ]

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* HERO SECTION — Hostinger-Tier Crisp Medical Elegance */}
      <section className="relative pt-8 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Soft Ambient Radiance */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-teal-500/15 via-emerald-400/10 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-12 right-12 w-[350px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-[1550px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Details */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-semibold shadow-sm">
                <Sparkles size={16} className="text-teal-600 dark:text-teal-400 animate-pulse" />
                <span>NABH Standard Clinic • Live OPD Queue</span>
                <span className="text-teal-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">Hubli Pilot</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Care Without Crowds.{' '}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                  Smart Live Queue
                </span>{' '}
                & OPD Platform.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Scan the clinic entrance QR code, check real-time doctor availability, track your live queue token with next-in-line alerts, and experience modern healthcare in your preferred language.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/public/queue"
                  className="btn btn-primary text-base px-6 py-3.5 flex items-center gap-2 shadow-xl shadow-teal-600/25 hover:scale-105"
                >
                  <Activity size={20} />
                  <span>Track Token Live</span>
                </Link>
                <Link
                  to={bookingLink}
                  className="btn btn-secondary text-base px-6 py-3.5 flex items-center gap-2 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  <Calendar size={20} className="text-teal-600" />
                  <span>Book Doctor Slot</span>
                </Link>
                <Link
                  to="/login"
                  className="btn bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-base px-5 py-3.5 flex items-center gap-2 font-bold"
                >
                  <ShieldCheck size={20} className="text-teal-400" />
                  <span>Role Login</span>
                </Link>
              </div>

              {/* Quick Search Strip */}
              <div className="pt-4 max-w-lg mx-auto lg:mx-0">
                <form
                  onSubmit={handleSearch}
                  className="card p-2 rounded-2xl flex items-center gap-2 border border-teal-500/30 shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur"
                >
                  <div className="pl-3 text-slate-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    placeholder="Enter Token Number (e.g. 101, 102, 103)..."
                    className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary text-xs py-2 px-4 whitespace-nowrap font-bold"
                  >
                    Check Status
                  </button>
                </form>
                {searchError && (
                  <p className="text-xs text-rose-500 mt-1.5 pl-3 font-semibold">Please enter a valid token number (e.g. 101, 102)</p>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">4.9/5</span>
                  <span>(1,240+ Patients)</span>
                </div>
                <span>•</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300">✓ QR Self-Service Check-In</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">✓ Real-time Queue Audio Alerts</span>
              </div>
            </motion.div>

            {/* Right Hero: Live Queue Calling Board Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />

                <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
                  {/* Card Header with Pulse Indicator */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">
                        OPD Live Now
                      </span>
                    </div>
                    <Link
                      to="/public/tv"
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                    >
                      <Monitor size={14} />
                      <span>Full TV Board</span>
                    </Link>
                  </div>

                  {/* Giant Calling Token Display */}
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Now In Consultation
                    </p>
                    <div className="inline-flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white font-black text-5xl sm:text-6xl shadow-xl shadow-teal-500/30 border-4 border-white dark:border-slate-800 animate-pulse-slow">
                      #{currentServingToken}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 pt-1">
                      Dr. Ramesh Hegde (Room 1)
                    </p>
                    <span className="inline-block badge badge-emerald text-xs">
                      Inside Doctor Cabin
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Next Token Alert</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        #{nextAlertToken}
                      </p>
                      <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Please be ready</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Patients Waiting</p>
                      <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
                        {queue.filter(q => q.status === 'WAITING').length} Patients
                      </p>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">~12 mins avg</span>
                    </div>
                  </div>

                  {/* QR Fast Check-in Callout inside Widget */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <QrCode size={22} className="text-teal-600" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-teal-900 dark:text-teal-200">Just Arrived at Clinic?</p>
                        <p className="text-[11px] text-slate-500">Scan QR to grab your token instantly</p>
                      </div>
                    </div>
                    <Link
                      to={bookingLink}
                      className="btn btn-primary text-xs py-1.5 px-3 font-bold"
                    >
                      Scan QR
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIVE OPD CAPACITY & RUSH METER STRIP */}
      <section className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Wait Time</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">~12 Mins</h4>
              <span className="text-[10px] text-emerald-600 font-bold">Fast-Flow OPD</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Stethoscope size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specialists on Duty</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">4 Active Doctors</h4>
              <span className="text-[10px] text-emerald-600 font-bold">Rooms 1, 2, 3 & 4</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/40">
            <div className="w-11 h-11 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consultations Today</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">104 Served</h4>
              <span className="text-[10px] text-cyan-600 font-bold">Token #{currentServingToken} In Cabin</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hospital Re-attendance</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">68% Revisited</h4>
              <span className="text-[10px] text-indigo-600 font-bold">Trusted Family Care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Searched Token Result Modal / Card */}
      <AnimatePresence>
        {searchedToken && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4"
          >
            <div className="rounded-3xl bg-gradient-to-br from-teal-500/10 via-white to-slate-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-teal-500/30 p-6 sm:p-8 shadow-xl relative">
              <button
                onClick={() => setSearchedToken(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕ Close
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
                <div>
                  <span className="text-xs uppercase font-bold text-teal-600 tracking-wider">
                    Token Lookup Result
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Token #{searchedToken.tokenNumber} — {searchedToken.patientName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Consulting With: <strong className="text-teal-600 dark:text-teal-400">{searchedToken.doctor}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className={`badge ${searchedToken.status === 'IN_CONSULTATION' ? 'badge-emerald' : 'badge-teal'} text-sm px-3.5 py-1`}>
                    {searchedToken.status === 'IN_CONSULTATION' ? 'Inside Doctor Cabin' : 'Waiting in Lounge'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Estimated Wait: <span className="font-bold text-slate-800 dark:text-slate-200">{searchedToken.estimatedWait}</span>
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ✓ Token Generated
                </div>
                <div className={`p-3 rounded-xl font-semibold border ${
                  searchedToken.stage >= 1
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
                }`}>
                  {searchedToken.ahead > 0 ? `${searchedToken.ahead} Patients Ahead` : 'Ready Next'}
                </div>
                <div className={`p-3 rounded-xl font-semibold border ${
                  searchedToken.stage === 2
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
                }`}>
                  Inside Doctor Cabin
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3 ROLE-BASED DASHBOARDS SHOWCASE SECTION */}
      <section className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">
            Unified Healthcare Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Three Dedicated Role Portals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Tailored workflows for Patients, Receptionists, and Doctors — keeping everyone synchronized in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Dashboard 1: User / Patient */}
          <div className="card p-7 hover:shadow-2xl hover:border-teal-500/50 transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <User size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Patient / User Dashboard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Scan clinic entrance QR code, check real-time doctor availability, take an instant queue token, track live wait position, and get sound alerts when your turn is next.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Interactive QR code scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Real-time Doctor availability roster</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>"You're Next" audio & visual alert</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Lifetime prescription history</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to={bookingLink}
                className="btn btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
              >
                <span>Open Patient Portal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Dashboard 2: Receptionist */}
          <div className="card p-7 hover:shadow-2xl hover:border-teal-500/50 transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <ClipboardList size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Receptionist Desk
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Accept/reject appointment requests, call next tokens with broadcast notifications, toggle doctor availability live, and fast-track check-ins for repeat patients.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>"Call Next Token" with audio chime</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Accept online booking requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Live Doctor Status editor (Ready/Break/Off)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Revisited patient auto-incrementer</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/portal/receptionist"
                className="btn btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
              >
                <span>Open Reception Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Dashboard 3: Doctor */}
          <div className="card p-7 hover:shadow-2xl hover:border-teal-500/50 transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Doctor Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cabin consultation view, search any patient by name to see full lifetime history & visit count, record vitals/Rx updates, and review visual repeat patient analytics.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Patient search & lifetime visit history</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Digital prescription & vitals writer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>"How many visited" trend charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Repeatedly came patients ratio graphs</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/portal/doctor"
                className="btn btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
              >
                <span>Open Doctor Workspace</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DOCTOR AVAILABILITY & INTERACTIVE SPECIALIST MATCHER */}
      <section className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">
              Verified Medical Specialists
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Live Doctor OPD Roster & Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time cabin status synced live from the clinic reception desk with instant appointment booking.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/60 dark:border-slate-700/60">
            {[
              { id: 'all', label: 'All Specialties' },
              { id: 'diabetology', label: 'Diabetology' },
              { id: 'pediatrics', label: 'Pediatrics' },
              { id: 'orthopedics', label: 'Orthopedics' },
              { id: 'dermatology', label: 'Dermatology' },
            ].map(dept => (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setSelectedDept(dept.id)
                  setSelectedSymptom(null)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDept === dept.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Symptom Matcher Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <HeartPulse size={16} className="text-emerald-400 animate-pulse" />
                <span>Interactive Symptom-To-Doctor Matcher</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Not sure which specialist to consult today?
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Click your primary symptom below to immediately identify the attending physician and their current queue status:
              </p>
            </div>

            {/* Quick Symptom Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'diabetes', label: 'Sugar & Fatigue', docId: 'doc-1', dept: 'diabetology' },
                { id: 'child', label: 'Child Cough/Fever', docId: 'doc-2', dept: 'pediatrics' },
                { id: 'knee', label: 'Knee & Joint Pain', docId: 'doc-3', dept: 'orthopedics' },
                { id: 'skin', label: 'Skin Rash/Allergy', docId: 'doc-4', dept: 'dermatology' },
              ].map(sym => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => {
                    setSelectedSymptom(selectedSymptom === sym.id ? null : sym.id)
                    setSelectedDept(sym.dept)
                  }}
                  className={`p-2.5 rounded-2xl text-left text-xs transition-all border ${
                    selectedSymptom === sym.id
                      ? 'bg-emerald-500 text-white border-emerald-300 shadow-md scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                >
                  <p className="font-bold flex items-center justify-between">
                    <span>{sym.label}</span>
                    {selectedSymptom === sym.id && <Check size={12} />}
                  </p>
                  <span className="text-[10px] text-teal-200 block mt-0.5">Auto-matches Doctor</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors
            .filter(doc => {
              if (selectedDept === 'all') return true
              if (selectedDept === 'diabetology') return doc.specialty.toLowerCase().includes('diabetes') || doc.specialty.toLowerCase().includes('general')
              if (selectedDept === 'pediatrics') return doc.specialty.toLowerCase().includes('pediatric') || doc.specialty.toLowerCase().includes('child')
              if (selectedDept === 'orthopedics') return doc.specialty.toLowerCase().includes('orthopedic') || doc.specialty.toLowerCase().includes('joint')
              if (selectedDept === 'dermatology') return doc.specialty.toLowerCase().includes('dermatology') || doc.specialty.toLowerCase().includes('skin')
              return true
            })
            .map(doc => {
              const isAvail = doc.status === 'AVAILABLE'
              const isInConsultation = doc.status === 'IN_CONSULTATION'
              const isBreak = doc.status === 'BREAK'
              const isHighlighted = (
                (selectedSymptom === 'diabetes' && doc.id === 'doc-1') ||
                (selectedSymptom === 'child' && doc.id === 'doc-2') ||
                (selectedSymptom === 'knee' && doc.id === 'doc-3') ||
                (selectedSymptom === 'skin' && doc.id === 'doc-4')
              )

              return (
                <div
                  key={doc.id}
                  className={`card p-6 border transition-all flex flex-col justify-between ${
                    isHighlighted
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-2xl scale-[1.02] bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-teal-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <DoctorAvatar
                        id={doc.id}
                        name={doc.name}
                        specialty={doc.specialty}
                        avatarUrl={doc.avatarUrl}
                        size="lg"
                        status={doc.status}
                      />
                      <span className={`badge ${
                        isAvail ? 'badge-emerald' : isInConsultation ? 'badge-amber' : 'badge-rose'
                      } text-[11px] font-bold`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500' : isInConsultation ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        {isAvail ? 'Ready Now' : isInConsultation ? 'In Cabin' : isBreak ? 'On Break' : 'Off Duty'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                        {doc.specialty}
                      </p>
                      <p className="text-[11px] text-slate-400">{doc.degrees}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Room:</span>
                        <strong className="text-slate-900 dark:text-white">{doc.room}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Fee:</span>
                        <strong className="text-teal-600 dark:text-teal-400">₹{doc.fee}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">OPD:</span>
                        <span className="text-slate-400 text-[11px]">{doc.shifts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <Link
                      to={bookingLink}
                      className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 hover:scale-105"
                    >
                      <Calendar size={14} />
                      <span>Book or Grab Token</span>
                    </Link>
                  </div>
                </div>
              )
            })}
        </div>
      </section>

      {/* HOW CLINICQUEUE WORKS — 4 Simple Steps */}
      <section className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">
              Effortless Patient Journey
            </span>
            <h2 className="text-3xl font-black">How It Works in 4 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h4 className="text-base font-bold text-white">Scan Clinic QR</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan the QR code placed at the clinic reception or front entrance on your smartphone.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h4 className="text-base font-bold text-white">Select Doctor</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                See real-time doctor availability and grab an instant walk-in token or pick a convenient time slot.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h4 className="text-base font-bold text-white">Live Turn Alert</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Relax anywhere. When the patient ahead of you is in cabin, your phone chimes with a "You Are Next" alert.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h4 className="text-base font-bold text-white">Digital Prescription</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Consult the doctor and instantly receive your prescription and follow-up revisit schedule on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">
            Patient Stories
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Trusted by 1,200+ Families in Hubli-Dharwad
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</h4>
                <p className="text-[11px] text-teal-600 dark:text-teal-400">{t.role}</p>
                <span className="text-[10px] text-slate-400">📍 {t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="card border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-teal-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
