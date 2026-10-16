import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../context/ThemeContext'
import { 
  Activity, 
  Calendar, 
  Search, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  PhoneCall,
  Stethoscope,
  HeartPulse,
  Monitor
} from 'lucide-react'

export default function LandingPage() {
  const { t } = useTranslation()
  const [tokenSearch, setTokenSearch] = useState('')
  const [searchedToken, setSearchedToken] = useState<any>(null)
  const [searchError, setSearchError] = useState(false)

  // Demo active clinic state (synchronized with backend seed)
  const [queueState] = useState({
    currentToken: 101,
    currentDoctor: 'Dr. Ramesh Hegde',
    nextToken: 102,
    totalWaiting: 3,
    avgWaitMinutes: 14,
    status: 'ACTIVE',
    clinicNotice: 'Dr. Ramesh Hegde & Dr. Ananya Rao are currently in clinic. Tokens are moving on schedule.',
  })

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchError(false)

    const num = parseInt(tokenSearch.trim(), 10)
    if (!num) {
      setSearchError(true)
      return
    }

    if (num === 101) {
      setSearchedToken({
        tokenNumber: 101,
        patientName: 'Suresh Kumar',
        status: 'IN_CONSULTATION',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: '0 mins (Now Inside Cabin)',
        ahead: 0,
        stage: 2,
      })
    } else if (num === 102) {
      setSearchedToken({
        tokenNumber: 102,
        patientName: 'Laxmi Desai',
        status: 'WAITING',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: '8-12 mins',
        ahead: 0,
        stage: 1,
      })
    } else if (num === 103) {
      setSearchedToken({
        tokenNumber: 103,
        patientName: 'Manjunath Kamath',
        status: 'WAITING',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: '18-24 mins',
        ahead: 1,
        stage: 1,
      })
    } else if (num === 104) {
      setSearchedToken({
        tokenNumber: 104,
        patientName: 'Fatima Begum',
        status: 'WAITING',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: '30-36 mins',
        ahead: 2,
        stage: 1,
      })
    } else {
      // Generic mock response for any token
      setSearchedToken({
        tokenNumber: num,
        patientName: 'Registered Patient',
        status: 'WAITING',
        doctor: 'Dr. Ramesh Hegde',
        estimatedWait: `${Math.max(10, (num - 100) * 12)} mins`,
        ahead: Math.max(1, num - 102),
        stage: 1,
      })
    }
  }

  return (
    <div className="space-y-16 pb-16 overflow-hidden">
      {/* Hero Section with Vibrant Aesthetics & Glassmorphism */}
      <section className="relative pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/20 via-emerald-400/15 to-cyan-500/10 blur-[110px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-[300px] h-[250px] bg-indigo-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Pilot Announcement Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-semibold shadow-sm">
                <Sparkles size={16} className="text-teal-600 dark:text-teal-400 animate-pulse" />
                <span>{t.badgePilot}</span>
                <span className="text-teal-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">Hubli, Karnataka</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {t.heroTitlePrefix}{' '}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                  {t.heroTitleHighlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/public/queue"
                  className="btn-primary text-base px-6 py-3.5 flex items-center gap-2 shadow-lg shadow-teal-500/25 hover:scale-105"
                >
                  <Activity size={20} />
                  <span>{t.checkTokenBtn}</span>
                </Link>
                <Link
                  to="/public/book"
                  className="btn-secondary text-base px-6 py-3.5 flex items-center gap-2 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  <Calendar size={20} />
                  <span>{t.bookAppointmentBtn}</span>
                </Link>
              </div>

              {/* Quick Search Strip inside Hero */}
              <div className="pt-6 max-w-lg mx-auto lg:mx-0">
                <form
                  onSubmit={handleSearch}
                  className="glass-card p-2 rounded-2xl flex items-center gap-2 border border-teal-500/20 shadow-md"
                >
                  <div className="pl-3 text-slate-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    placeholder={t.enterTokenPlaceholder}
                    className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="btn-primary text-xs py-2 px-4 whitespace-nowrap font-semibold"
                  >
                    {t.trackBtn}
                  </button>
                </form>
                {searchError && (
                  <p className="text-xs text-rose-500 mt-1.5 pl-3">Please enter a valid token number (e.g. 101, 102)</p>
                )}
              </div>
            </motion.div>

            {/* Right Live Token At-A-Glance Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />

                <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
                  {/* Card Header with Pulse Indicator */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                        Live OPD Active
                      </span>
                    </div>
                    <Link
                      to="/public/tv"
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                    >
                      <Monitor size={14} />
                      <span>{t.navTvDisplay}</span>
                    </Link>
                  </div>

                  {/* Giant Calling Token Display */}
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.currentToken}
                    </p>
                    <div className="inline-flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white font-extrabold text-5xl sm:text-6xl shadow-xl shadow-teal-500/30 border-4 border-white dark:border-slate-800 animate-pulse-slow">
                      #{queueState.currentToken}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 pt-1">
                      {queueState.currentDoctor}
                    </p>
                    <span className="inline-block badge badge-emerald text-xs">
                      {t.statusInConsultation}
                    </span>
                  </div>

                  {/* Queue Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.nextToken}</p>
                      <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                        #{queueState.nextToken}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">Ready next</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.totalWaiting}</p>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
                        {queueState.totalWaiting} Patients
                      </p>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">~{queueState.avgWaitMinutes} {t.mins}</span>
                    </div>
                  </div>

                  {/* Notice strip */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-teal-50/50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900/50 flex items-start gap-2">
                    <Activity size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>{queueState.clinicNotice}</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
                    {t.tokenStatus}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Token #{searchedToken.tokenNumber} — {searchedToken.patientName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.consultingWith}: <strong className="text-teal-600 dark:text-teal-400">{searchedToken.doctor}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="badge badge-teal text-sm px-3.5 py-1">
                    {searchedToken.status === 'IN_CONSULTATION' ? t.statusInConsultation : t.statusWaiting}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.estimatedWait}: <span className="font-bold text-slate-800 dark:text-slate-200">{searchedToken.estimatedWait}</span>
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
                  {searchedToken.ahead > 0 ? `${searchedToken.ahead} ${t.patientAhead}` : 'Ready Next'}
                </div>
                <div className={`p-3 rounded-xl font-semibold border ${
                  searchedToken.stage === 2
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
                }`}>
                  {t.statusInConsultation}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* OPD Schedule & Doctors Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-bold text-teal-600 tracking-wider">
            Verified Clinicians
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.opdScheduleTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Consult experienced doctors with transparent fees and pre-booked or walk-in queue slots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Doctor 1 */}
          <div className="card p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-teal-500/40 transition-all border border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl">
                    <Stethoscope size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Ramesh Hegde</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{t.drRameshSpecialty}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">18+ Years Clinical Experience</span>
                  </div>
                </div>
                <span className="badge badge-teal">Available Today</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Morning Shift:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">09:00 AM - 01:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Evening Shift:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">05:00 PM - 09:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>{t.fee}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹350 (Follow-up free within 7 days)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/public/book"
                className="btn-primary w-full text-center py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                <span>Book with Dr. Ramesh Hegde</span>
              </Link>
            </div>
          </div>

          {/* Doctor 2 */}
          <div className="card p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-teal-500/40 transition-all border border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xl">
                    <HeartPulse size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Ananya Rao</h3>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">{t.drAnanyaSpecialty}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Child Immunization & Growth Specialist</span>
                  </div>
                </div>
                <span className="badge badge-emerald">Available Today</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Child OPD Hours:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">10:00 AM - 02:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Vaccination Clinic:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">11:30 AM - 01:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>{t.fee}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹400 (Includes growth charting)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/public/book"
                className="btn-primary w-full text-center py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                <span>Book with Dr. Ananya Rao</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why ClinicQueue Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-bold text-teal-600 tracking-wider">
            Healthcare Innovation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.featuresTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 hover:-translate-y-1 transition-transform border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.feature1Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature1Desc}</p>
          </div>

          <div className="card p-6 hover:-translate-y-1 transition-transform border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.feature2Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature2Desc}</p>
          </div>

          <div className="card p-6 hover:-translate-y-1 transition-transform border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.feature3Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature3Desc}</p>
          </div>

          <div className="card p-6 hover:-translate-y-1 transition-transform border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.feature4Title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature4Desc}</p>
          </div>
        </div>
      </section>

      {/* Emergency Assistance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
                <AlertCircle size={14} />
                <span>24/7 Helpline Support</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">{t.emergencyTitle}</h3>
              <p className="text-slate-300 text-sm">{t.emergencyContact}</p>
            </div>
            <a
              href="tel:+919480012345"
              className="btn bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 whitespace-nowrap"
            >
              <PhoneCall size={18} />
              <span>Call Doctor Directly</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
