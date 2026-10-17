import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Maximize2, Clock, Stethoscope } from 'lucide-react'
import { useClinic, sortQueueInOrder } from '../../context/ClinicContext'
import MedicalLogo from '../../components/brand/MedicalLogo'

export default function TvQueueDisplay() {
  const { queue, currentServingToken, doctors } = useClinic()
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN'))

  const currentInConsultation = queue.find(q => q.status === 'IN_CONSULTATION') || queue[0]
  const currentDoctor = doctors.find(d => d.id === currentInConsultation?.doctorId) || doctors[0]
  const upcoming = sortQueueInOrder(queue.filter(q => q.status === 'WAITING'))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* TV Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <MedicalLogo to="/" subtitle="OPD Waiting Lounge Display • Vidyanagar, Hubli" size="lg" />

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono tracking-wider text-teal-300">
              {time}
            </div>
            <span className="text-xs text-slate-400">Session Active</span>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-2xl border transition-all ${
              audioEnabled ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Voice Chime"
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Fullscreen Mode"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </header>

      {/* Main TV Board Body */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Left Big Calling Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-900 border-2 border-teal-500/50 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                NOW CALLING / ಈಗ ಕರೆಯುತ್ತಿರುವ ಟೋಕನ್
              </span>
            </div>

            <div className="py-6 sm:py-8 space-y-4">
              <p className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                Please Enter {currentDoctor.room}
              </p>
              <div className="inline-flex items-center justify-center w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-7xl sm:text-8xl shadow-2xl shadow-teal-500/40 border-4 border-white animate-pulse-slow">
                #{currentServingToken}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentInConsultation?.patientName || 'Waiting for Patient'}
                </h3>
                <p className="text-sm font-semibold text-teal-400 flex items-center justify-center gap-2">
                  <Stethoscope size={18} />
                  <span>{currentDoctor.name} ({currentDoctor.room})</span>
                </p>
              </div>
            </div>

            <div className="inline-block px-6 py-2 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-sm border border-teal-500/30">
              ✓ In Consultation • परामर्श जारी
            </div>
          </div>
        </div>

        {/* Right Up Next Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
              <Clock size={18} className="text-teal-400" />
              <span>UP NEXT IN QUEUE / ಮುಂದಿನ ಟೋಕನ್‌ಗಳು</span>
            </h2>
            <span className="text-xs text-slate-500">Auto-sequence</span>
          </div>

          <div className="space-y-3">
            {upcoming.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl flex items-center justify-between border ${
                  idx === 0
                    ? 'bg-slate-900 border-teal-500/60 shadow-lg shadow-teal-500/10'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                    idx === 0
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{item.tokenNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">{item.patientName}</h4>
                    <p className="text-xs text-slate-400">Approx wait: {item.estimatedWaitMinutes || (idx + 1) * 8} mins</p>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                }`}>
                  {idx === 0 ? 'Ready Next' : `Position ${idx + 1}`}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Multilingual Announcement Ticker */}
      <footer className="border-t border-slate-800 pt-4">
        <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex items-center gap-3 overflow-hidden text-sm">
          <span className="badge bg-teal-500 text-slate-950 font-bold px-3 py-1 uppercase text-xs shrink-0">
            NOTICE
          </span>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm text-slate-300">
            📢 <strong>English:</strong> Please carry your previous prescription and laboratory reports. | <strong>ಕನ್ನಡ:</strong> ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಿಂದಿನ ಔಷಧ ರಶೀದಿ ಮತ್ತು ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ಜೊತೆಗೆ ತನ್ನಿ. | <strong>हिंदी:</strong> कृपया अपनी पिछली पर्ची और जांच रिपोर्ट साथ रखें।
          </div>
        </div>
      </footer>
    </div>
  )
}
