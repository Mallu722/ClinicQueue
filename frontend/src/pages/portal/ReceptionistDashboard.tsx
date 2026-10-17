import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClinic, Doctor, DoctorStatus, sortQueueInOrder } from '../../context/ClinicContext'
import { useToast } from '../../context/ToastContext'
import DoctorAvatar from '../../components/brand/DoctorAvatar'
import { 
  Calendar, 
  Clock, 
  Phone, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Stethoscope, 
  UserCheck, 
  UserPlus, 
  ArrowRight,
  Check,
  Edit3,
  X
} from 'lucide-react'

export default function ReceptionistDashboard() {
  const { 
    doctors, 
    queue, 
    appointments, 
    patients, 
    callNextToken, 
    updateDoctorStatus, 
    updateDoctorDetails,
    acceptAppointment, 
    rejectAppointment,
    checkInRevisitedPatient,
    checkInPatient,
    nextAlertToken,
    activeAlert
  } = useClinic()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'doctors' | 'revisit'>('queue')
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Doctor Availability Editor Modal state for Receptionist
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [editStatus, setEditStatus] = useState<DoctorStatus>('AVAILABLE')
  const [editRoom, setEditRoom] = useState('')
  const [editShifts, setEditShifts] = useState('')
  const [editStatusNote, setEditStatusNote] = useState('')
  const [editFee, setEditFee] = useState<number>(350)

  // Revisited Patient Search state
  const [revisitSearch, setRevisitSearch] = useState('')
  const [selectedPatientForRevisit, setSelectedPatientForRevisit] = useState<any>(null)
  const [revisitComplaint, setRevisitComplaint] = useState('')
  const [revisitDoctorId, setRevisitDoctorId] = useState(doctors[0]?.id || 'doc-1')

  // New Walk-in Patient Modal
  const [showWalkinModal, setShowWalkinModal] = useState(false)
  const [walkinName, setWalkinName] = useState('')
  const [walkinPhone, setWalkinPhone] = useState('')
  const [walkinAge, setWalkinAge] = useState('35')
  const [walkinGender, setWalkinGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [walkinReason, setWalkinReason] = useState('')
  const [walkinDocId, setWalkinDocId] = useState(doctors[0]?.id || 'doc-1')

  // Filtered and strictly sorted queue items in proper order
  const filteredQueue = sortQueueInOrder(
    queue.filter(item => {
      const matchesDoc = selectedDoctorFilter === 'all' || item.doctorId === selectedDoctorFilter
      const matchesSearch = item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.patientPhone.includes(searchQuery) ||
                            item.tokenNumber.toString().includes(searchQuery)
      return matchesDoc && matchesSearch
    })
  )

  // Pending appointment requests
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING')

  // Handle Call Next Token with Sound/Visual broadcast
  const handleCallNext = (docId?: string) => {
    callNextToken(docId)
    // Sound chime simulation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3) // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.5)
    } catch {
      // AudioContext not supported
    }

    addToast({
      title: 'Token Called & Alert Dispatched!',
      message: `Current token advanced. Next person in line notified!`,
      type: 'success',
    })
  }

  // Handle Revisited Search
  const handleSearchRevisited = () => {
    if (!revisitSearch.trim()) return
    const q = revisitSearch.toLowerCase().trim()
    const found = patients.find(p => 
      p.phone.includes(q) || 
      p.name.toLowerCase().includes(q) || 
      p.mrn.toLowerCase().includes(q)
    )
    if (found) {
      setSelectedPatientForRevisit(found)
      addToast({
        title: `Patient Record Found: ${found.name}`,
        message: `Total visits recorded: ${found.totalVisits}. Last seen: ${found.lastVisitDate}`,
        type: 'info',
      })
    } else {
      setSelectedPatientForRevisit(null)
      addToast({
        title: 'Patient Not Found',
        message: 'No existing patient matches this search. You can register as a new walk-in.',
        type: 'warning',
      })
    }
  }

  // Handle Check-in Revisited
  const handleCheckInRevisited = () => {
    if (!selectedPatientForRevisit) return
    const entry = checkInRevisitedPatient(selectedPatientForRevisit.id, revisitComplaint, revisitDoctorId)
    if (entry) {
      addToast({
        title: `Revisited Token #${entry.tokenNumber} Generated!`,
        message: `${selectedPatientForRevisit.name} checked in for Visit #${entry.visitCount}`,
        type: 'success',
      })
      setSelectedPatientForRevisit(null)
      setRevisitComplaint('')
      setRevisitSearch('')
      setActiveTab('queue')
    }
  }

  // Handle Walkin Submit
  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!walkinName || !walkinPhone) return
    const entry = checkInPatient({
      patientName: walkinName,
      patientPhone: walkinPhone,
      patientAge: parseInt(walkinAge) || 30,
      patientGender: walkinGender,
      doctorId: walkinDocId,
      reason: walkinReason || 'General checkup',
      isRevisit: false,
    })
    setShowWalkinModal(false)
    setWalkinName('')
    setWalkinPhone('')
    setWalkinReason('')
    addToast({
      title: `Walk-in Token #${entry.tokenNumber} Created!`,
      message: `${entry.patientName} added to ${entry.doctorName}'s queue.`,
      type: 'success',
    })
  }

  return (
    <div className="space-y-8 max-w-[1550px] mx-auto pb-12">
      {/* Top Operations Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-teal">Reception & Triage Ops</span>
            <span className="text-xs text-slate-400">• Desk #1 (Live)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Receptionist Queue & OPD Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Accept online booking requests, call next tokens with audio alerts, toggle doctor availability, and fast-track repeat patients.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleCallNext()}
            className="btn btn-primary px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 hover:scale-105"
          >
            <Bell size={18} className="animate-pulse" />
            <span>Call Next Token</span>
          </button>

          <button
            onClick={() => setShowWalkinModal(true)}
            className="btn btn-secondary px-4 py-3 text-sm font-semibold flex items-center gap-2"
          >
            <UserPlus size={18} className="text-teal-600" />
            <span>New Walk-In</span>
          </button>

          <button
            onClick={() => setActiveTab('revisit')}
            className="btn bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 px-4 py-3 text-sm font-bold flex items-center gap-2"
          >
            <UserCheck size={18} />
            <span>Check-in Revisited Patient</span>
          </button>
        </div>
      </div>

      {/* Live Broadcast Alert Bar */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-teal-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {activeAlert.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {activeAlert.message}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
            {activeAlert.timestamp}
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-300/60 dark:border-slate-700/60">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'queue'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock size={16} />
          <span>Active Queue List ({queue.filter(q => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'appointments'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar size={16} />
          <span>Appointment Requests</span>
          {pendingAppointments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'doctors'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={16} />
          <span>Doctor Availability ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('revisit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'revisit'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck size={16} />
          <span>Revisited Patients Manager</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE QUEUE LIST */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Quick Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-80">
              <Search size={18} className="text-slate-400 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone, or token..."
                className="w-full bg-transparent text-xs sm:text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Doctor:</span>
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="input py-1.5 px-3 text-xs w-full sm:w-auto font-semibold"
              >
                <option value="all">All Doctors ({doctors.length})</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.room})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Token #</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Assigned Doctor</th>
                    <th className="py-3.5 px-4">Visit Status</th>
                    <th className="py-3.5 px-4">Patient Type</th>
                    <th className="py-3.5 px-4">Wait Time</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQueue.map(item => {
                    const isCalling = item.status === 'IN_CONSULTATION'
                    const isCompleted = item.status === 'COMPLETED'
                    const isNext = item.tokenNumber === nextAlertToken

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isCalling ? 'bg-teal-50/60 dark:bg-teal-950/30' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-black text-base text-slate-900 dark:text-white">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-extrabold ${
                            isCalling 
                              ? 'bg-teal-600 text-white shadow-md' 
                              : isNext
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            #{item.tokenNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          <div>
                            <span>{item.patientName}</span>
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {item.patientAge}y • {item.patientGender} • {item.reason}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {item.patientPhone}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-teal-700 dark:text-teal-300 block">
                            {item.doctorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {doctors.find(d => d.id === item.doctorId)?.room || 'Room 1'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${
                            isCalling 
                              ? 'badge-teal font-extrabold' 
                              : isCompleted 
                              ? 'badge-emerald' 
                              : 'badge-amber'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {item.isRevisit ? (
                            <span className="badge badge-emerald text-[10px] font-bold">
                              ✓ Revisit (Visit #{item.visitCount})
                            </span>
                          ) : (
                            <span className="badge badge-teal text-[10px]">
                              New Patient
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium text-xs">
                          {isCalling ? 'Now Inside' : isCompleted ? 'Finished' : `~${item.estimatedWaitMinutes} mins`}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCompleted && (
                              <button
                                onClick={() => handleCallNext(item.doctorId)}
                                className="btn btn-primary text-xs py-1.5 px-3 font-bold"
                              >
                                Call Next
                              </button>
                            )}
                          </div>
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

      {/* TAB 2: APPOINTMENT REQUESTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Online & QR Appointment Requests ({appointments.length})
              </h3>
              <p className="text-xs text-slate-500">
                Incoming booking requests sent from the clinic landing page and QR code scans.
              </p>
            </div>
            <span className="badge badge-amber font-bold">
              {pendingAppointments.length} Pending Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(apt => {
              const isPending = apt.status === 'PENDING'
              const isAccepted = apt.status === 'ACCEPTED'

              return (
                <div
                  key={apt.id}
                  className="card p-5 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {apt.bookingId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={12} />
                        <span>{apt.patientPhone}</span>
                      </p>
                    </div>
                    <span className={`badge ${isPending ? 'badge-amber' : isAccepted ? 'badge-emerald' : 'badge-rose'}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Doctor:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{apt.doctorName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preferred Slot:</span>
                      <strong className="text-teal-600 dark:text-teal-400">{apt.timeSlot} • {apt.date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Symptoms:</span>
                      <span className="text-slate-600 dark:text-slate-300 italic">{apt.reason}</span>
                    </div>
                    {apt.assignedToken && (
                      <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400">Assigned Token:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-black">#{apt.assignedToken}</strong>
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          acceptAppointment(apt.id)
                          addToast({
                            title: 'Appointment Request Accepted',
                            message: `Token generated and WhatsApp notification sent to ${apt.patientPhone}`,
                            type: 'success',
                          })
                        }}
                        className="btn btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept & Issue Token</span>
                      </button>
                      <button
                        onClick={() => {
                          rejectAppointment(apt.id)
                          addToast({
                            title: 'Request Declined',
                            message: 'Patient informed via SMS',
                            type: 'warning',
                          })
                        }}
                        className="btn btn-secondary py-2 px-3 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Check size={16} />
                      <span>Token #{apt.assignedToken} Placed in Active Queue</span>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR AVAILABILITY MANAGER */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Doctor Availability & OPD Controls
              </h3>
              <p className="text-xs text-slate-500">
                Receptionists can edit doctor availability statuses, assign consultation rooms, update OPD shifts, and broadcast live notice announcements.
              </p>
            </div>
            <span className="badge badge-teal self-start sm:self-auto">Live OPD Sync</span>
          </div>

          {/* Quick Roster Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Specialists</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{doctors.length} Doctors</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Ready / Available</span>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                {doctors.filter(d => d.status === 'AVAILABLE').length} Available
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-center">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">In Cabin</span>
              <span className="text-lg font-black text-amber-800 dark:text-amber-200">
                {doctors.filter(d => d.status === 'IN_CONSULTATION').length} In Cabin
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800 text-center">
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase block">On Break</span>
              <span className="text-lg font-black text-orange-800 dark:text-orange-200">
                {doctors.filter(d => d.status === 'BREAK').length} On Break
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase block">Leave / Off</span>
              <span className="text-lg font-black text-purple-800 dark:text-purple-200">
                {doctors.filter(d => d.status === 'ON_LEAVE' || d.status === 'OFF_DUTY').length} Inactive
              </span>
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map(doc => (
              <div
                key={doc.id}
                className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar
                      id={doc.id}
                      name={doc.name}
                      specialty={doc.specialty}
                      avatarUrl={doc.avatarUrl}
                      size="md"
                      status={doc.status}
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{doc.degrees}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    doc.status === 'AVAILABLE' ? 'badge-emerald' :
                    doc.status === 'IN_CONSULTATION' ? 'badge-amber' :
                    doc.status === 'BREAK' ? 'badge-rose' :
                    doc.status === 'ON_LEAVE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300' :
                    'badge-slate'
                  } text-[11px] font-bold`}>
                    {doc.status === 'ON_LEAVE' ? 'On Leave' : doc.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Status Notice if set */}
                {doc.statusNote && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-600">📢</span>
                      <span>{doc.statusNote}</span>
                    </span>
                    <button
                      onClick={() => updateDoctorDetails(doc.id, { statusNote: '' })}
                      className="text-amber-600 hover:text-amber-800 text-[10px] font-bold underline"
                      title="Clear notice"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Quick 1-Click Status Bar (5 Statuses) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Quick Availability Toggle:
                    </span>
                    <span className="text-[10px] text-slate-400">1-click broadcast</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {(['AVAILABLE', 'IN_CONSULTATION', 'BREAK', 'ON_LEAVE', 'OFF_DUTY'] as DoctorStatus[]).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          updateDoctorStatus(doc.id, status)
                          addToast({
                            title: `${doc.name} Status Changed`,
                            message: `Updated to ${status.replace('_', ' ')}`,
                            type: 'info',
                          })
                        }}
                        className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${
                          doc.status === status
                            ? status === 'AVAILABLE'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : status === 'IN_CONSULTATION'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : status === 'BREAK'
                              ? 'bg-orange-600 text-white shadow-sm'
                              : status === 'ON_LEAVE'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {status === 'AVAILABLE' ? '🟢 Ready' :
                         status === 'IN_CONSULTATION' ? '🟡 Cabin' :
                         status === 'BREAK' ? '☕ Break' :
                         status === 'ON_LEAVE' ? '🏖️ Leave' : '⚪ Off'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shift Timings & Room Info Strip */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Cabin:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{doc.room}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">OPD Shift Hours:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">{doc.shifts}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Consultation Fee:</span>
                    <strong className="text-teal-600 font-bold">₹{doc.fee}</strong>
                  </div>
                </div>

                {/* Full Availability & Schedule Edit Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoctor(doc)
                    setEditStatus(doc.status)
                    setEditRoom(doc.room)
                    setEditShifts(doc.shifts)
                    setEditStatusNote(doc.statusNote || '')
                    setEditFee(doc.fee)
                  }}
                  className="w-full btn btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 shadow-sm"
                >
                  <Edit3 size={15} />
                  <span>Edit Availability, Cabin & Shifts</span>
                </button>

                {/* Footer with Serving Token */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <span>Currently Serving: <strong className="text-teal-600 font-bold">#{doc.currentToken}</strong></span>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {doc.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVISITED PATIENTS FAST CHECK-IN */}
      {activeTab === 'revisit' && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="max-w-2xl">
              <span className="badge badge-emerald mb-2">Returning / Repeat Patients</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Revisited Patient Lookup & Fast Check-In
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Quickly locate an existing patient profile by Phone, Name, or MRN. Check them in with 1 click while preserving their full medical timeline and visit counter.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={revisitSearch}
                  onChange={(e) => setRevisitSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRevisited()}
                  placeholder="Enter phone (e.g. 9845044444) or name (e.g. Suresh)"
                  className="input pl-10"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchRevisited}
                className="btn btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <span>Find Patient</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Quick Demo Search Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold">Try sample patients:</span>
              <button
                type="button"
                onClick={() => {
                  setRevisitSearch('9845044444')
                  const p = patients.find(x => x.phone === '9845044444')
                  if (p) setSelectedPatientForRevisit(p)
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-100"
              >
                Suresh Kumar (5 Visits)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRevisitSearch('9845066666')
                  const p = patients.find(x => x.phone === '9845066666')
                  if (p) setSelectedPatientForRevisit(p)
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-100"
              >
                Manjunath Kamath (6 Visits)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRevisitSearch('9845055555')
                  const p = patients.find(x => x.phone === '9845055555')
                  if (p) setSelectedPatientForRevisit(p)
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-100"
              >
                Laxmi Desai (3 Visits)
              </button>
            </div>

            {/* Selected Patient Record Card */}
            {selectedPatientForRevisit && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-slate-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-teal-500/30 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-emerald text-xs font-bold">
                        Verified Returning Patient
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedPatientForRevisit.mrn}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedPatientForRevisit.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedPatientForRevisit.age}y • {selectedPatientForRevisit.gender} • Blood Group: <strong>{selectedPatientForRevisit.bloodGroup}</strong> • Phone: {selectedPatientForRevisit.phone}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                      {selectedPatientForRevisit.totalVisits} Total Visits
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      First Visited: {selectedPatientForRevisit.firstVisitDate} • Last: {selectedPatientForRevisit.lastVisitDate}
                    </p>
                  </div>
                </div>

                {/* Check-In Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assign Doctor for Today:
                    </label>
                    <select
                      value={revisitDoctorId}
                      onChange={(e) => setRevisitDoctorId(e.target.value)}
                      className="input"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty} - {d.room})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Today's Symptoms / Revisit Reason:
                    </label>
                    <input
                      type="text"
                      value={revisitComplaint}
                      onChange={(e) => setRevisitComplaint(e.target.value)}
                      placeholder="e.g. Routine 3-month review, refill prescription..."
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedPatientForRevisit(null)}
                    className="btn btn-secondary text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckInRevisited}
                    className="btn btn-primary text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 shadow-lg hover:scale-105"
                  >
                    <CheckCircle2 size={16} />
                    <span>Generate Revisited Token (Visit #{selectedPatientForRevisit.totalVisits + 1})</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* WALK-IN PATIENT MODAL */}
      <AnimatePresence>
        {showWalkinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-teal-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Register New Walk-In Patient
                  </h3>
                </div>
                <button
                  onClick={() => setShowWalkinModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateWalkin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Enter full name"
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={walkinAge}
                      onChange={(e) => setWalkinAge(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={walkinGender}
                      onChange={(e) => setWalkinGender(e.target.value as any)}
                      className="input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Doctor
                    </label>
                    <select
                      value={walkinDocId}
                      onChange={(e) => setWalkinDocId(e.target.value)}
                      className="input"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.room})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Visit / Symptoms
                  </label>
                  <input
                    type="text"
                    value={walkinReason}
                    onChange={(e) => setWalkinReason(e.target.value)}
                    placeholder="e.g. Fever, headache, regular checkup..."
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 text-sm font-bold shadow-lg mt-4"
                >
                  Generate Token & Assign to Queue
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DOCTOR AVAILABILITY & OPD SCHEDULE MODAL FOR RECEPTIONIST */}
      <AnimatePresence>
        {editingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <DoctorAvatar
                    id={editingDoctor.id}
                    name={editingDoctor.name}
                    specialty={editingDoctor.specialty}
                    avatarUrl={editingDoctor.avatarUrl}
                    size="md"
                    status={editStatus}
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Edit Doctor Availability & OPD Schedule
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                      {editingDoctor.name} • {editingDoctor.specialty}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  updateDoctorDetails(editingDoctor.id, {
                    status: editStatus,
                    room: editRoom,
                    shifts: editShifts,
                    statusNote: editStatusNote,
                    fee: editFee,
                  })
                  addToast({
                    title: `${editingDoctor.name} Roster Updated!`,
                    message: `Status set to ${editStatus.replace('_', ' ')} in ${editRoom}. Synced with Patient Portal & OPD Displays.`,
                    type: 'success',
                  })
                  setEditingDoctor(null)
                }}
                className="space-y-5 text-xs"
              >
                {/* 1. Doctor Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Current Availability Status:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { val: 'AVAILABLE', label: '🟢 Ready / Available', desc: 'OPD open, accepting patients' },
                      { val: 'IN_CONSULTATION', label: '🟡 In Consultation', desc: 'Attending patient in cabin' },
                      { val: 'BREAK', label: '☕ On Break', desc: 'Temporary break / tea / lunch' },
                      { val: 'ON_LEAVE', label: '🏖️ On Leave Today', desc: 'Absent for the day' },
                      { val: 'OFF_DUTY', label: '⚪ Off Duty', desc: 'Shift concluded' },
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setEditStatus(item.val as DoctorStatus)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          editStatus === item.val
                            ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm ring-1 ring-teal-500'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold block text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Consultation Cabin Room */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Consultation Room / Cabin:
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="e.g. Consultation Room 1, OPD Cabin 4..."
                    className="input w-full py-2.5 px-3 rounded-xl font-semibold mb-2"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {['Consultation Room 1', 'Consultation Room 2', 'Consultation Room 3', 'Consultation Room 4', 'OPD Cabin A', 'Emergency Room'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditRoom(r)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          editRoom === r 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. OPD Shift Timings */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    OPD Shift Hours / Working Hours:
                  </label>
                  <input
                    type="text"
                    value={editShifts}
                    onChange={(e) => setEditShifts(e.target.value)}
                    placeholder="e.g. 09:00 AM - 01:30 PM | 05:00 PM - 09:00 PM"
                    className="input w-full py-2.5 px-3 rounded-xl font-semibold mb-2"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '09:00 AM - 01:30 PM',
                      '05:00 PM - 09:00 PM',
                      '09:00 AM - 01:30 PM | 05:00 PM - 09:00 PM',
                      '10:00 AM - 02:00 PM',
                      '02:00 PM - 06:00 PM',
                    ].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditShifts(s)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                          editShifts === s
                            ? 'bg-teal-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Real-time Status Notice / Announcement */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient OPD Announcement / Away Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={editStatusNote}
                    onChange={(e) => setEditStatusNote(e.target.value)}
                    placeholder="e.g. Lunch break until 2:30 PM, In emergency surgery, Doctor running 15 mins late..."
                    className="input w-full py-2.5 px-3 rounded-xl font-medium mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Lunch break until 2:30 PM',
                      'Emergency ward rounds — Resuming at 11:30 AM',
                      'Running ~15 mins behind schedule',
                      'Accepting walk-in tokens only',
                    ].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEditStatusNote(n)}
                        className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 text-[10px] font-medium hover:bg-amber-100"
                      >
                        + {n}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Broadcast instantly to the Patient Portal, Available Doctors directory, and OPD TV Display.
                  </span>
                </div>

                {/* 5. Consultation Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    OPD Consultation Fee (₹):
                  </label>
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}
                    className="input w-full py-2.5 px-3 rounded-xl font-bold text-teal-600"
                    min={0}
                    step={50}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 py-3 text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Save Availability & Broadcast to OPD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="btn btn-secondary py-3 px-5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
