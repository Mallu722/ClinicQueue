import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  CheckCircle2, 
  Stethoscope, 
  MessageSquare,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { useClinic } from '../../context/ClinicContext'
import { useAuth } from '../../context/AuthContext'

export default function BookAppointmentPublic() {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { bookNewAppointment, doctors } = useClinic()
  const { isAuthenticated } = useAuth()

  // Requirement: anyone trying to book a slot must be taken to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const [doctor, setDoctor] = useState('doc-1')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('Male')
  const [age, setAge] = useState('32')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const slots = [
    { time: '09:30 AM', shift: 'Morning' },
    { time: '10:00 AM', shift: 'Morning' },
    { time: '10:30 AM', shift: 'Morning' },
    { time: '11:00 AM', shift: 'Morning' },
    { time: '11:30 AM', shift: 'Morning' },
    { time: '12:00 PM', shift: 'Morning' },
    { time: '05:30 PM', shift: 'Evening' },
    { time: '06:00 PM', shift: 'Evening' },
    { time: '06:30 PM', shift: 'Evening' },
    { time: '07:00 PM', shift: 'Evening' },
    { time: '07:30 PM', shift: 'Evening' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !phone.trim() || !selectedSlot) {
      addToast({
        title: 'Please complete all required fields',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      const selectedDocObj = doctors.find(d => d.id === doctor || d.name.toLowerCase().includes(doctor.toLowerCase())) || doctors[0]
      
      const req = bookNewAppointment({
        patientName: fullName,
        patientPhone: phone,
        patientAge: parseInt(age) || 30,
        patientGender: gender as any,
        doctorId: selectedDocObj.id,
        doctorName: selectedDocObj.name,
        date,
        timeSlot: selectedSlot,
        reason: reason || 'Scheduled OPD consultation',
      })

      const bookingData = {
        bookingId: req.bookingId,
        patientName: fullName,
        phone,
        doctor: selectedDocObj.name,
        date,
        time: selectedSlot,
        clinic: 'Shanti Ayush Health Clinic, Hubli',
      }
      setSubmitted(bookingData)
      addToast({
        title: t.bookingSuccessTitle,
        message: 'Request forwarded to reception desk.',
        type: 'success',
      })
    }, 400)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <Calendar size={14} className="text-teal-600" />
          <span>Online OPD Booking System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t.bookAppointmentTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t.bookAppointmentDesc}
        </p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="badge badge-emerald text-sm">Booking Confirmed</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.bookingSuccessTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {t.bookingSuccessMsg}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Reference:</span>
              <strong className="text-teal-600 dark:text-teal-400">{submitted.bookingId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <strong className="text-slate-900 dark:text-white">{submitted.patientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor:</span>
              <strong className="text-slate-900 dark:text-white">{submitted.doctor}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Slot:</span>
              <strong className="text-slate-900 dark:text-white">{submitted.date} at {submitted.time}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Vidyanagar, Hubli</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setSubmitted(null)
                setFullName('')
                setPhone('')
              }}
              className="btn-secondary text-sm py-2.5 px-6"
            >
              Book Another Appointment
            </button>
            <a
              href={`https://wa.me/?text=Appointment%20confirmed%20at%20ClinicQueue%20for%20${submitted.date}%20at%20${submitted.time}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-sm py-2.5 px-6 flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              <span>Open in WhatsApp</span>
            </a>
          </div>
        </motion.div>
      ) : (
        <div className="card p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Doctor Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                1. {t.selectDoctor}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDoctor('doc-ramesh-hegde')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    doctor === 'doc-ramesh-hegde'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Ramesh Hegde</h4>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">General Physician & Diabetology</p>
                      <span className="text-[11px] text-slate-500">₹350 • 09:00 AM - 01:30 PM & 05:00 - 09:00 PM</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDoctor('doc-ananya-rao')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    doctor === 'doc-ananya-rao'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Ananya Rao</h4>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Pediatrician & Child Health</p>
                      <span className="text-[11px] text-slate-500">₹400 • 10:00 AM - 02:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  2. {t.selectDate}
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="input py-2.5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  3. {t.selectTimeSlot}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {slots.slice(0, 6).map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSlot === slot.time
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-500'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Patient Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gender & Age
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input w-1/2"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                      className="input w-1/2"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.reasonForVisit}
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.reasonPlaceholder}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Consent Note */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-start gap-3 text-xs text-teal-800 dark:text-teal-300">
              <MessageSquare size={18} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Instant WhatsApp Confirmation:</strong> We will automatically dispatch your token number, directions, and live queue tracking link to your WhatsApp number.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Scheduling Appointment...' : t.confirmBookingBtn}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
