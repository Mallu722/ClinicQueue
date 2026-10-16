import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ToastContainer } from '../../context/ToastContext'
import { useToast } from '../../context/ToastContext'

interface Doctor {
  id: string
  name: string
  specialty: string
  availableSlots: string[]
}

const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Smith', specialty: 'General Physician', availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'] },
  { id: '2', name: 'Dr. Johnson', specialty: 'Pediatrician', availableSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM'] },
  { id: '3', name: 'Dr. Patel', specialty: 'Dermatologist', availableSlots: ['09:30 AM', '10:30 AM', '03:30 PM', '04:30 PM'] },
]

export default function BookAppointment() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      addToast({
        title: 'Appointment Booked',
        message: `Appointment with ${selectedDoctor?.name} at ${selectedSlot} has been confirmed`,
        type: 'success'
      })
      navigate('/appointments')
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/appointments')} icon={<ArrowLeft size={18} />}>
          Back to Appointments
        </Button>
        <h1 className="text-2xl font-bold text-text-primary">Book Appointment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book a New Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Doctor */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-medium text-text-primary">Select a Doctor</h3>
                <div className="grid grid-cols-1 gap-4">
                  {doctors.map(doctor => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-background-border hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-text-primary">{doctor.name}</h4>
                          <p className="text-sm text-text-secondary">{doctor.specialty}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedDoctor?.id === doctor.id ? 'border-primary-600 bg-primary-600' : 'border-background-border'
                        }`}>
                          {selectedDoctor?.id === doctor.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Date and Slot */}
            {step === 2 && selectedDoctor && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-medium text-text-primary mb-4">Select Date</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const date = new Date()
                      date.setDate(date.getDate() + i)
                      const isSelected = false // Implement selection logic
                      return (
                        <div
                          key={day}
                          className={`p-3 rounded-xl text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-background-card hover:bg-primary-50'
                          }`}
                        >
                          <p className="text-sm font-medium">{day}</p>
                          <p className="text-lg font-bold">{date.getDate()}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-4">Available Slots</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedDoctor.availableSlots.map(slot => (
                      <div
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-xl text-center cursor-pointer transition-all ${
                          selectedSlot === slot
                            ? 'bg-primary-600 text-white'
                            : 'bg-background-card hover:bg-primary-50'
                        }`}
                      >
                        <Clock size={20} className={`mx-auto mb-2 ${selectedSlot === slot ? 'text-white' : 'text-primary-600'}`} />
                        <p className="font-medium">{slot}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Reason for Visit */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Reason for Visit</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe the reason for the appointment..."
                    className="input min-h-[100px]"
                    required
                  />
                </div>

                <div className="bg-primary-50 p-4 rounded-xl">
                  <h4 className="font-medium text-primary-600 mb-2">Appointment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Doctor:</span>
                      <span className="font-medium text-text-primary">{selectedDoctor?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Date:</span>
                      <span className="font-medium text-text-primary">Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Time:</span>
                      <span className="font-medium text-text-primary">{selectedSlot}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-background-border">
              <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
                Back
              </Button>
              {step === 1 ? (
                <Button variant="primary" onClick={() => setStep(2)} disabled={!selectedDoctor}>
                  Next <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : step === 2 ? (
                <Button variant="primary" onClick={() => setStep(3)} disabled={!selectedSlot}>
                  Next <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <ToastContainer />
    </motion.div>
  )
}
