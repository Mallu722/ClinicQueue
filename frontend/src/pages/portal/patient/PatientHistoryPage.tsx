import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useClinic, VisitHistoryRecord } from '../../../context/ClinicContext'
import { useAuth } from '../../../context/AuthContext'
import { 
  FileText, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Pill, 
  Printer, 
  Check, 
  AlertTriangle, 
  X, 
  Search,
  ShieldCheck,
  Edit2
} from 'lucide-react'

export default function PatientHistoryPage() {
  const { user } = useAuth()
  const { getPatientProfileForUser, updatePatientDemographics } = useClinic()

  // Match current patient strictly — new users get clean, pristine first-time profile!
  const patient = getPatientProfileForUser(user)

  const [searchFilter, setSearchFilter] = useState('')
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<VisitHistoryRecord | null>(null)
  const [showEditDemographics, setShowEditDemographics] = useState(false)
  const [editBloodGroup, setEditBloodGroup] = useState(patient.bloodGroup || 'B+')
  const [editAllergies, setEditAllergies] = useState(patient.allergies.join(', '))

  // Interactive pill tracker state for today
  const [takenPills, setTakenPills] = useState<Record<string, boolean>>({
    'pill-1': true,
    'pill-2': false,
    'pill-3': false,
  })

  const togglePill = (id: string) => {
    setTakenPills(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filtered visits
  const filteredVisits = patient.visits.filter(v => {
    const q = searchFilter.toLowerCase()
    return (
      v.diagnosis.toLowerCase().includes(q) ||
      v.doctorName.toLowerCase().includes(q) ||
      v.symptoms.toLowerCase().includes(q) ||
      v.prescriptions.some(rx => rx.drug.toLowerCase().includes(q))
    )
  })

  // Active latest prescription
  const latestVisit = patient.visits[0]
  const activeTablets = latestVisit?.prescriptions || []

  const handleSaveDemographics = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAllergies = editAllergies
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    updatePatientDemographics(patient.id, {
      bloodGroup: editBloodGroup,
      allergies: parsedAllergies,
    })
    setShowEditDemographics(false)
  }

  const isNewPatient = patient.visits.length === 0

  return (
    <div className="space-y-8">
      {/* Patient Profile Summary Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-teal text-xs font-bold uppercase">Electronic Health Record (EHR)</span>
              {isNewPatient ? (
                <span className="badge bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold">
                  First-Time Patient Profile
                </span>
              ) : (
                <span className="badge badge-emerald text-xs font-bold">Lifetime Record</span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Medical History & Past Prescriptions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patient: <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong> • MRN: {patient.mrn} • Phone: {patient.phone || 'Not Registered'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-center">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase block">Total Visits</span>
              <span className="text-xl font-black text-teal-800 dark:text-teal-200">{patient.totalVisits} Times</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">First Visit</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{patient.firstVisitDate}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Seen</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{patient.lastVisitDate}</span>
            </div>
          </div>
        </div>

        {/* Patient Vitals & Health Alerts Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Blood Group & Demographics:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 font-extrabold text-[11px] whitespace-nowrap">
                  {patient.bloodGroup || 'Not Recorded'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {patient.age ? `${patient.age} Yrs` : 'Age N/A'} • {patient.gender}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditBloodGroup(patient.bloodGroup || 'B+')
                setEditAllergies(patient.allergies.join(', '))
                setShowEditDemographics(true)
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Edit Demographics & Allergies"
            >
              <Edit2 size={14} />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 sm:col-span-2 flex items-start justify-between gap-2">
            <div>
              <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} />
                <span>Documented Clinical Allergies:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((all, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold">
                      ⚠️ {all}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 font-medium">No known drug allergies reported.</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setEditBloodGroup(patient.bloodGroup || 'B+')
                setEditAllergies(patient.allergies.join(', '))
                setShowEditDemographics(true)
              }}
              className="btn btn-secondary py-1 px-2.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 shrink-0"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S MEDICINE SCHEDULE / PILL TRACKER WIDGET */}
      {activeTablets.length > 0 ? (
        <div className="card p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Pill size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Today's Prescribed Tablet Schedule</span>
                  <span className="badge bg-teal-500 text-slate-950 text-[10px] font-extrabold uppercase">
                    Active Rx
                  </span>
                </h3>
                <p className="text-xs text-teal-200">
                  Daily dosage tracker based on Dr. {latestVisit?.doctorName || 'Doctor'}'s latest prescription.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-teal-300">
              {Object.values(takenPills).filter(Boolean).length} of {activeTablets.length} Doses Taken
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeTablets.map((rx, idx) => {
              const pillId = `pill-${idx + 1}`
              const isTaken = takenPills[pillId]
              return (
                <div
                  key={idx}
                  onClick={() => togglePill(pillId)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isTaken
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100 shadow-sm'
                      : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold block leading-tight">{rx.drug}</span>
                    <span className="text-[11px] text-teal-200 font-semibold block">{rx.dosage} • {rx.frequency}</span>
                    <span className="text-[10px] text-slate-300 italic block">{rx.instructions}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isTaken ? 'bg-emerald-500 text-slate-950 font-black' : 'border border-white/40'
                  }`}>
                    {isTaken && <Check size={14} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Today's Prescribed Tablet Schedule
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No active prescription schedules. When your doctor writes a digital prescription during your OPD visit, daily medicine reminders will automatically appear here.
              </p>
            </div>
          </div>
          <span className="badge badge-teal text-xs font-semibold whitespace-nowrap self-start sm:self-auto">0 Active Rx</span>
        </div>
      )}

      {/* Visits Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-teal-600" />
            <span>Consultation History & Prescriptions ({patient.visits.length} Visits)</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isNewPatient 
              ? 'Complete your first OPD consultation to receive your digital prescription slip and doctor notes.'
              : 'Review detailed diagnoses, recorded vitals, and tablets prescribed during each visit.'}
          </p>
        </div>

        {patient.visits.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search diagnosis or tablet..."
              className="input pl-9 text-xs py-2 rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Visits Chronological Stream */}
      <div className="space-y-6">
        {isNewPatient ? (
          <div className="card p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center shadow-inner">
              <FileText size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                No Medical History or Past Prescriptions
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                You are logged in for the first time. As a new patient, no OPD consultations, recorded vitals, or digital prescriptions exist on your file yet.
              </p>
            </div>

            {/* Next Steps Infographic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-left pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Book / Walk In</h5>
                <p className="text-[11px] text-slate-500">Pick an available specialist or scan the clinic QR code at the desk.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Doctor Consultation</h5>
                <p className="text-[11px] text-slate-500">Physician records your vitals, diagnosis, and prescribed tablets.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant EHR Sync</h5>
                <p className="text-[11px] text-slate-500">Your official prescription slip and dosage schedules appear here.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/portal/patient"
                className="btn btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
              >
                <Stethoscope size={16} />
                <span>Browse Available Specialists</span>
              </Link>
              <Link
                to="/portal/patient/queue"
                className="btn btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
              >
                <Clock size={16} />
                <span>Check Live Queue Status</span>
              </Link>
            </div>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <Search size={24} className="text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No visits matched "{searchFilter}"</h4>
            <p className="text-xs text-slate-400">Try searching with a different diagnosis or tablet name.</p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
          <motion.div
            key={visit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6"
          >
            {/* Visit Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {visit.doctorName}
                    </h4>
                    <span className="badge badge-emerald text-[11px] font-bold">Completed Visit</span>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-2 mt-0.5">
                    <Calendar size={13} />
                    <span>Visited on {visit.date}</span>
                    <span>•</span>
                    <Clock size={13} />
                    <span>OPD Consultation</span>
                  </p>
                </div>
              </div>

              {/* Action: Print / Download Prescription Slip */}
              <button
                onClick={() => setSelectedVisitForPrint(visit)}
                className="btn btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-2 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
                <Printer size={15} />
                <span>Print Official Rx Slip</span>
              </button>
            </div>

            {/* Diagnosis & Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 space-y-1">
                <span className="font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider text-[10px]">
                  Clinical Diagnosis:
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {visit.diagnosis}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Reported Symptoms & Complaints:
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  "{visit.symptoms}"
                </p>
              </div>
            </div>

            {/* Recorded Vitals on this Visit */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Vitals Recorded on {visit.date}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</span>
                  <strong className="text-slate-900 dark:text-white font-black">{visit.vitals.bp}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Pulse Rate</span>
                  <strong className="text-slate-900 dark:text-white font-black">{visit.vitals.pulse} bpm</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Temperature</span>
                  <strong className="text-slate-900 dark:text-white font-black">{visit.vitals.temp}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">SpO2 Oxygen</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">{visit.vitals.spo2}%</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Blood Sugar</span>
                  <strong className="text-slate-900 dark:text-white font-black">{visit.vitals.bloodSugar || 'Normal'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Body Weight</span>
                  <strong className="text-slate-900 dark:text-white font-black">{visit.vitals.weight || '71 kg'}</strong>
                </div>
              </div>
            </div>

            {/* Prescribed Tablets & Medicines List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Pill size={15} className="text-teal-600" />
                  <span>Prescribed Tablets & Dosage Schedule ({visit.prescriptions.length} Medicines):</span>
                </span>
                <span className="text-[11px] text-teal-600 font-semibold">Pharmacy Dispensed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visit.prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {rx.drug}
                          </h5>
                          <span className="text-[11px] text-slate-400 font-medium">Dosage: {rx.dosage}</span>
                        </div>
                      </div>
                      <span className="badge badge-teal text-[10px] font-bold">
                        {rx.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950 px-2 py-0.5 rounded-md text-[11px]">
                        Frequency: {rx.frequency}
                      </span>
                      <span className="text-slate-500 text-[11px] italic font-medium">
                        "{rx.instructions}"
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Clinical Advice / Notes */}
            {visit.clinicalNotes && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] block">
                  Doctor's Clinical Notes & Lifestyle Advice:
                </span>
                <p className="italic leading-relaxed">
                  "{visit.clinicalNotes}"
                </p>
                {visit.followUpDate && (
                  <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 pt-1">
                    🗓️ Recommended Follow-up Consultation Date: {visit.followUpDate}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )))}
      </div>

      {/* PRINT OFFICIAL PRESCRIPTION SLIP MODAL */}
      <AnimatePresence>
        {selectedVisitForPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedVisitForPrint(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full print:hidden"
              >
                <X size={20} />
              </button>

              {/* Clinic Header Stamp */}
              <div className="border-b-2 border-teal-600 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-teal-800">
                    SHANTI AYUSH HEALTH CLINIC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vidyanagar OPD Wing • Multi-Specialty Health Center • Reg: KMC/2018/8892
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Helpline: +91 98450 12345 • Email: health@shantiayush.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    Official Rx Slip
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">Date: {selectedVisitForPrint.date}</p>
                </div>
              </div>

              {/* Patient & Doctor Demographics */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                <div>
                  <p><span className="text-slate-500">Patient:</span> <strong>{patient.name}</strong></p>
                  <p><span className="text-slate-500">MRN:</span> <strong>{patient.mrn}</strong></p>
                  <p><span className="text-slate-500">Age / Gender:</span> <strong>{patient.age} Yrs / {patient.gender}</strong></p>
                  <p><span className="text-slate-500">Blood Group:</span> <strong>{patient.bloodGroup}</strong></p>
                </div>
                <div>
                  <p><span className="text-slate-500">Consultant:</span> <strong>{selectedVisitForPrint.doctorName}</strong></p>
                  <p><span className="text-slate-500">Recorded BP:</span> <strong>{selectedVisitForPrint.vitals.bp}</strong></p>
                  <p><span className="text-slate-500">Pulse:</span> <strong>{selectedVisitForPrint.vitals.pulse} bpm</strong></p>
                  <p><span className="text-slate-500">Diagnosis:</span> <strong className="text-teal-700">{selectedVisitForPrint.diagnosis}</strong></p>
                </div>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-serif font-black text-teal-800">℞</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Medical Prescriptions & Tablet Schedule
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Tablet / Medicine</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedVisitForPrint.prescriptions.map((rx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{rx.drug}</td>
                          <td className="p-2.5">{rx.dosage}</td>
                          <td className="p-2.5 text-teal-800 font-semibold">{rx.frequency}</td>
                          <td className="p-2.5">{rx.duration}</td>
                          <td className="p-2.5 text-slate-500 italic">{rx.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor's Advice & Signature Area */}
              <div className="flex items-end justify-between pt-4 border-t border-slate-200 text-xs">
                <div className="space-y-1 max-w-sm">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Doctor's Instructions:</span>
                  <p className="italic text-slate-700">{selectedVisitForPrint.clinicalNotes}</p>
                  <p className="font-semibold text-teal-800">Follow-up: {selectedVisitForPrint.followUpDate || 'As advised'}</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-dashed border-slate-400 h-8" />
                  <p className="font-bold text-slate-800">{selectedVisitForPrint.doctorName}</p>
                  <span className="text-[10px] text-slate-400 block font-semibold">Authorized Physician Seal</span>
                </div>
              </div>

              {/* Print Modal Footer */}
              <div className="pt-3 flex gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Printer size={16} />
                  <span>Print Prescription Slip</span>
                </button>
                <button
                  onClick={() => setSelectedVisitForPrint(null)}
                  className="btn btn-secondary py-3 px-5 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CLINICAL DEMOGRAPHICS & ALLERGIES MODAL */}
      <AnimatePresence>
        {showEditDemographics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="font-bold text-base">Update Patient Health Details</h4>
                </div>
                <button
                  onClick={() => setShowEditDemographics(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDemographics} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Blood Group:
                  </label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="input w-full py-2.5 px-3 rounded-xl font-semibold"
                  >
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Known Drug & Clinical Allergies (comma separated):
                  </label>
                  <textarea
                    rows={3}
                    value={editAllergies}
                    onChange={(e) => setEditAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, None..."
                    className="input w-full py-2 px-3 rounded-xl font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Alerts will be flagged to the consulting doctor during your visit.
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 py-2.5 text-xs font-bold shadow-md"
                  >
                    Save & Update EHR
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditDemographics(false)}
                    className="btn btn-secondary py-2.5 px-4 text-xs"
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
