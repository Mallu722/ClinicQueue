import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useClinic } from '../../../context/ClinicContext'
import { 
  Stethoscope, 
  Clock, 
  FileText, 
  HelpCircle, 
  Bell, 
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PatientLayout() {
  const { user } = useAuth()
  const { queue, currentServingToken, nextAlertToken, getPatientProfileForUser } = useClinic()
  const location = useLocation()

  // Dynamic patient profile matching
  const patientProfile = getPatientProfileForUser(user)

  // Strictly match active queue token (null for first-time / unchecked-in users)
  const cleanPhone = user?.phone ? user.phone.replace(/\D/g, '') : ''
  const myQueueItem = queue.find(q => {
    const qPhone = q.patientPhone ? q.patientPhone.replace(/\D/g, '') : ''
    if (cleanPhone && qPhone && cleanPhone === qPhone) return true
    if (user?.name && user.name.toLowerCase() !== 'verified patient' && q.patientName.toLowerCase() === user.name.toLowerCase()) return true
    return false
  })
  const userToken = myQueueItem ? myQueueItem.tokenNumber : null

  const isMyTurnNow = userToken !== null && currentServingToken === userToken
  const isMyTurnNext = userToken !== null && nextAlertToken === userToken

  // Tabs for Patient Multi-Page Portal
  const navTabs = [
    {
      to: '/portal/patient',
      exact: true,
      label: 'Doctor Directory & Availability',
      shortLabel: 'Available Doctors',
      icon: Stethoscope,
      badge: null,
      description: 'Which doctor is available & credentials',
    },
    {
      to: '/portal/patient/queue',
      exact: false,
      label: 'Live Queue & Turn Tracker',
      shortLabel: 'Live Queue',
      icon: Clock,
      badge: isMyTurnNow ? 'NOW' : isMyTurnNext ? 'NEXT' : userToken ? `#${userToken}` : null,
      description: 'Sequential order & wait time',
    },
    {
      to: '/portal/patient/history',
      exact: false,
      label: 'My Past Visits & Prescribed Tablets',
      shortLabel: 'Past Visits & Rx',
      icon: FileText,
      badge: patientProfile.visits.length > 0 ? `${patientProfile.visits.length} Visits` : '0 Visits',
      description: 'Visit history, diagnoses & medicines',
    },
    {
      to: '/portal/patient/help',
      exact: false,
      label: 'Clinic Guide & SOS Helpline',
      shortLabel: 'Help & SOS',
      icon: HelpCircle,
      badge: null,
      description: 'Front desk dial & clinic guide',
    },
  ]

  return (
    <div className="max-w-[1550px] mx-auto space-y-6 pb-12">
      {/* Top Patient Header Strip */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-7 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold backdrop-blur">
              <User size={14} />
              <span>Patient Self-Service Portal</span>
              <span>•</span>
              <span>MRN: {patientProfile.mrn}</span>
              <span>•</span>
              <span>Blood Group: {patientProfile.bloodGroup}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || patientProfile.name}
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Explore available specialists, check real-time OPD room availability, monitor your queue turn, and review past visits with prescribed tablets.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
              <span className="text-[11px] text-teal-200 font-semibold block uppercase tracking-wider">
                {userToken !== null ? 'Your Token' : 'Queue Status'}
              </span>
              {userToken !== null ? (
                <>
                  <span className="text-2xl font-black text-white">#{userToken}</span>
                  <span className="text-[10px] text-emerald-300 block font-bold">
                    {isMyTurnNow ? 'Inside Cabin' : isMyTurnNext ? 'Next Up!' : 'In Queue'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-white block mt-1">Not in Line</span>
                  <span className="text-[10px] text-teal-200 block font-medium">Ready to Join</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Turn Notification Banner */}
      <AnimatePresence>
        {isMyTurnNow ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex items-center justify-between gap-4 border-2 border-white/40"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                #{userToken}
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider">
                  It's Your Turn Now! Proceed to Consultation Room 1
                </h3>
                <p className="text-xs text-emerald-100">
                  Dr. Ramesh Hegde is ready for you. Please enter the doctor's cabin now.
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
                <h3 className="text-lg font-black tracking-wide">
                  🚨 Token #{userToken}: You Are Next In Line!
                </h3>
                <p className="text-xs text-amber-100">
                  Token #{currentServingToken} is currently inside. Please proceed towards Consultation Room 1 and wait at the door.
                </p>
              </div>
            </div>
            <span className="badge bg-white text-amber-900 font-extrabold px-3 py-1 text-xs">
              NEXT UP
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Multi-Page Navigation Bar / Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.exact 
              ? location.pathname === tab.to 
              : location.pathname.startsWith(tab.to)

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.exact}
                className={({ isActive: active }) =>
                  `flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-xl transition-all font-semibold text-xs sm:text-sm ${
                    active
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="font-bold leading-tight block">{tab.shortLabel}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        tab.badge === 'NOW' ? 'bg-emerald-500 text-white animate-pulse' :
                        tab.badge === 'NEXT' ? 'bg-amber-500 text-white animate-bounce' :
                        'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-[11px] text-slate-400 font-normal truncate mt-0.5">
                    {tab.description}
                  </span>
                </div>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Nested Page Content Outlet */}
      <div>
        <Outlet />
      </div>
    </div>
  )
}
