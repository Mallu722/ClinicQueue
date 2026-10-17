import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useClinic, sortQueueInOrder } from '../../../context/ClinicContext'
import { useAuth } from '../../../context/AuthContext'
import { 
  Clock, 
  CheckCircle2, 
  Bell, 
  MapPin, 
  Volume2,
  Stethoscope
} from 'lucide-react'

export default function PatientQueuePage() {
  const { user } = useAuth()
  const { queue, currentServingToken, nextAlertToken, doctors } = useClinic()

  // Match patient token strictly
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

  // Doctor assigned
  const doctor = myQueueItem ? (doctors.find(d => d.id === myQueueItem?.doctorId) || doctors[0]) : doctors[0]

  // Strictly sorted live queue
  const sortedQueue = sortQueueInOrder(
    queue.filter(q => q.status === 'WAITING' || q.status === 'IN_CONSULTATION')
  )

  // Calculate position ahead
  const waitingAhead = userToken !== null ? sortedQueue.filter(
    q => q.status === 'WAITING' && q.tokenNumber < userToken
  ).length : 0

  const estWaitMins = isMyTurnNow ? 0 : isMyTurnNext ? 3 : (waitingAhead + 1) * 6

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.5)
    } catch {}
  }

  return (
    <div className="space-y-8">
      {/* Turn Alert Banner */}
      <AnimatePresence>
        {isMyTurnNow ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-white/40"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-3xl">
                #{userToken}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  <span>Your Turn is Active! Step into {doctor.room}</span>
                </h3>
                <p className="text-xs text-emerald-100">
                  {doctor.name} is waiting for you in {doctor.room}. Please proceed inside immediately.
                </p>
              </div>
            </div>
            <button
              onClick={playChime}
              className="btn bg-white text-emerald-800 font-bold px-4 py-2.5 text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-md"
            >
              <Volume2 size={16} />
              <span>Play Door Chime</span>
            </button>
          </motion.div>
        ) : isMyTurnNext ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-white/40 animate-pulse-slow"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                <Bell size={28} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-wide">
                  🚨 Alert: Token #{userToken}, You Are Next in Line!
                </h3>
                <p className="text-xs text-amber-100">
                  Token #{currentServingToken} is in consultation. Please move to {doctor.room} door and prepare your reports.
                </p>
              </div>
            </div>
            <span className="badge bg-white text-amber-900 font-extrabold px-3 py-1.5 text-xs whitespace-nowrap">
              PLEASE STAND BY DOOR
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Live Queue Progress Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Live Queue Progress
                </span>
              </div>
              <span className="badge badge-teal text-[11px] font-bold">Synchronized</span>
            </div>

            {/* Giant Token Counter or Empty State */}
            {userToken !== null ? (
              <div className="text-center py-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Assigned OPD Token
                </span>
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white font-black text-5xl shadow-xl shadow-teal-500/25 border-4 border-white dark:border-slate-800">
                  #{userToken}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {doctor.name}
                  </h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {doctor.room} • {myQueueItem?.reason || 'Routine Consultation'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Clock size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    You Are Not in the Live Queue Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    To join the queue and track your position live, book an appointment or scan the clinic QR code at desk #4.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/portal/patient"
                    className="btn btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Stethoscope size={15} />
                    <span>Choose Doctor & Get Token</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Live Queue Comparison Grid */}
            <div className="grid grid-cols-3 gap-2.5 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Now Calling</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  #{currentServingToken}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Next Up</span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  #{nextAlertToken}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Est. Wait</span>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {estWaitMins}m
                </p>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Queue Step</span>
                <span className="text-teal-600 dark:text-teal-400">
                  {isMyTurnNow ? 'Step 3/3 (Inside Cabin)' : isMyTurnNext ? 'Step 2/3 (Next up!)' : 'Step 1/3 (Waiting in Lounge)'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  initial={{ width: '30%' }}
                  animate={{
                    width: isMyTurnNow ? '100%' : isMyTurnNext ? '75%' : '35%',
                  }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                {userToken !== null
                  ? `Tokens advance sequentially in strict order. You will hear an audible chime and see a banner when Token #${userToken - 1} enters.`
                  : 'Tokens advance sequentially in strict order. Please stay near the waiting lounge when your token is called.'}
              </p>
            </div>
          </div>

          {/* Cabin Directions Card */}
          <div className="p-5 rounded-3xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2.5">
            <h4 className="text-xs font-black text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} className="text-teal-600" />
              <span>Cabin Directions:</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{doctor.room}:</strong> Located on Ground Floor, Corridor B, opposite Pharmacy Counter 2.
            </p>
          </div>
        </div>

        {/* Right Column: Full Queue List in Strict Numerical Order */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={20} className="text-teal-600" />
                <span>Sequential OPD Queue Order</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live list of patients ordered strictly chronologically by token number.
              </p>
            </div>
            <span className="badge badge-teal text-xs font-bold">
              {sortedQueue.length} Active in Line
            </span>
          </div>

          <div className="space-y-3">
            {sortedQueue.map((item, idx) => {
              const isServing = item.status === 'IN_CONSULTATION'
              const isMine = item.tokenNumber === userToken
              const isNext = item.tokenNumber === nextAlertToken

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isMine
                      ? 'bg-teal-50/90 dark:bg-teal-950/70 border-teal-500 shadow-md ring-2 ring-teal-500/30'
                      : isServing
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                      : isNext
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      isMine
                        ? 'bg-teal-600 text-white shadow-md'
                        : isServing
                        ? 'bg-emerald-600 text-white'
                        : isNext
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      #{item.tokenNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.patientName} {isMine && '(You)'}
                        </h4>
                        {item.isRevisit && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                            Visit #{item.visitCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.doctorName} • {item.reason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`badge text-[11px] font-extrabold px-3 py-1 ${
                      isServing
                        ? 'badge-emerald'
                        : isNext
                        ? 'badge-amber'
                        : 'badge-teal'
                    }`}>
                      {isServing ? 'Now in Cabin' : isNext ? 'Ready Next' : `Position ${idx + 1}`}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                      {isServing ? '0m wait' : `Est. ${item.estimatedWaitMinutes || (idx * 6)}m`}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
