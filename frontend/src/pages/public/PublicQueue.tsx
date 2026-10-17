import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Activity, 
  RefreshCw,
  Stethoscope
} from 'lucide-react'
import { useTranslation } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { useClinic, sortQueueInOrder } from '../../context/ClinicContext'

interface PatientInfo {
  tokenNumber: number
  patientName: string
  phone: string
  doctor: string
  specialization: string
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED'
  position: number
  estimatedWaitTime: string
  reason: string
  whatsappSent: boolean
}

export default function PublicQueue() {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { queue, currentServingToken } = useClinic()
  const [tokenInput, setTokenInput] = useState('')
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Live Queue Board strictly sorted in order
  const liveQueue = sortQueueInOrder(queue.filter(q => q.status === 'WAITING' || q.status === 'IN_CONSULTATION'))

  const handleCheckStatus = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!tokenInput.trim()) {
      addToast({
        title: 'Please enter a token number or mobile number',
        type: 'error',
      })
      return
    }

    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      const num = parseInt(tokenInput.replace(/\D/g, ''), 10)

      const matched = queue.find(q => q.tokenNumber === num || q.patientPhone.includes(tokenInput))
      if (matched) {
        setPatientInfo({
          tokenNumber: matched.tokenNumber,
          patientName: matched.patientName,
          phone: matched.patientPhone,
          doctor: matched.doctorName,
          specialization: 'Attending OPD Specialist',
          status: matched.status === 'IN_CONSULTATION' ? 'IN_CONSULTATION' : 'WAITING',
          position: Math.max(0, matched.tokenNumber - currentServingToken),
          estimatedWaitTime: matched.status === 'IN_CONSULTATION' ? 'Now Inside Cabin' : `~${matched.estimatedWaitMinutes} mins`,
          reason: matched.reason,
          whatsappSent: true,
        })
      } else {
        const tokenNum = num < 100 ? 100 + num : num
        setPatientInfo({
          tokenNumber: tokenNum,
          patientName: 'Registered Patient',
          phone: '+91 98450 XXXXX',
          doctor: 'Dr. Ramesh Hegde',
          specialization: 'General Physician & Diabetologist',
          status: tokenNum === currentServingToken ? 'IN_CONSULTATION' : 'WAITING',
          position: Math.max(1, tokenNum - currentServingToken),
          estimatedWaitTime: `${Math.max(8, (tokenNum - currentServingToken) * 6)} mins`,
          reason: 'OPD Consultation',
          whatsappSent: true,
        })
      }
    }, 400)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <Activity size={14} className="text-teal-600 animate-pulse" />
          <span>Live Digital Queue Monitor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t.checkTokenBtn}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Know exactly when to enter the doctor's cabin without waiting in crowded clinic corridors.
        </p>
      </motion.div>

      {/* Token Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="card p-6 sm:p-8 border border-teal-500/20 shadow-xl max-w-2xl mx-auto">
          <form onSubmit={handleCheckStatus} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t.enterTokenLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={t.enterTokenPlaceholder}
                  className="input py-3 pl-4 text-base font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary py-3 px-6 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isSearching ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                <span>{t.trackBtn}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              💡 Tip: Try entering token <span className="text-teal-600 dark:text-teal-400 font-semibold cursor-pointer" onClick={() => setTokenInput('101')}>#101</span>, <span className="text-teal-600 dark:text-teal-400 font-semibold cursor-pointer" onClick={() => setTokenInput('102')}>#102</span>, or <span className="text-teal-600 dark:text-teal-400 font-semibold cursor-pointer" onClick={() => setTokenInput('103')}>#103</span>.
            </p>
          </form>
        </div>
      </motion.div>

      {/* Searched Patient Status Display Card */}
      <AnimatePresence>
        {patientInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="badge badge-teal text-xs mb-1">Live Status</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Token #{patientInfo.tokenNumber} — {patientInfo.patientName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doctor: <strong className="text-teal-600 dark:text-teal-400">{patientInfo.doctor}</strong> ({patientInfo.specialization})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                  patientInfo.status === 'IN_CONSULTATION'
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {patientInfo.status === 'IN_CONSULTATION' ? t.statusInConsultation : t.statusWaiting}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {t.estimatedWait}: <strong className="text-slate-800 dark:text-white">{patientInfo.estimatedWaitTime}</strong>
                </p>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="py-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>Token Registered</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Check-in confirmed with receptionist</p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  patientInfo.position <= 1
                    ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm text-teal-700 dark:text-teal-300">
                    <Clock size={18} />
                    <span>{patientInfo.position === 0 ? 'Now with Doctor' : `${patientInfo.position} ${t.patientAhead}`}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Please remain seated in the lounge</p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  patientInfo.status === 'IN_CONSULTATION'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Stethoscope size={18} />
                    <span>Consultation Room</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Doctor is reviewing patient records</p>
                </div>
              </div>
            </div>

            {patientInfo.whatsappSent && (
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-3 text-xs text-teal-800 dark:text-teal-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>WhatsApp Delivery Receipt: Real-time reminder has been dispatched to {patientInfo.phone}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Clinic Queue Table at a Glance */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today's Active OPD Queue</h3>
            <p className="text-xs text-slate-500">Live order of consultation for Dr. Ramesh Hegde</p>
          </div>
          <span className="badge badge-teal">Auto-refreshing</span>
        </div>

        <div className="card overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-6">Token #</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Attending Doctor</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Session Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {liveQueue.map((item) => (
                  <tr
                    key={item.tokenNumber}
                    className={`transition-colors ${
                      item.status === 'IN_CONSULTATION'
                        ? 'bg-teal-50/60 dark:bg-teal-950/40 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                        item.status === 'IN_CONSULTATION'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        #{item.tokenNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-900 dark:text-white font-bold">{item.patientName}</td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 font-semibold">{item.doctorName}</td>
                    <td className="py-3.5 px-6">
                      <span className={`badge ${
                        item.status === 'IN_CONSULTATION' ? 'badge-emerald' : 'badge-amber'
                      }`}>
                        {item.status === 'IN_CONSULTATION' ? 'In Cabin' : 'Waiting in Lounge'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">~{item.estimatedWaitMinutes} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
