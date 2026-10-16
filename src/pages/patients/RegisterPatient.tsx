import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, Calendar, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ToastContainer } from '../../context/ToastContext'
import { useToast } from '../../context/ToastContext'

interface PatientForm {
  name: string
  phone: string
  email: string
  age: string
  gender: 'Male' | 'Female' | 'Other' | ''
  dateOfBirth: string
  address: string
  medicalConditions: string
  allergies: string
}

const initialForm: PatientForm = {
  name: '',
  phone: '',
  email: '',
  age: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  medicalConditions: '',
  allergies: '',
}

export default function RegisterPatient() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<PatientForm>(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof PatientForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock submission
    setTimeout(() => {
      setLoading(false)
      addToast({
        title: 'Patient Registered',
        message: `${formData.name} has been successfully registered`,
        type: 'success'
      })
      navigate('/patients')
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
        <Button variant="secondary" onClick={() => navigate('/patients')} icon={<ArrowLeft size={18} />}>
          Back to Patients
        </Button>
        <h1 className="text-2xl font-bold text-text-primary">Register New Patient</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Patient's full name"
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Mobile number"
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="patient@email.com"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="Years"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="input"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Patient's address"
                    className="input min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Medical Information */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Medical Conditions (Optional)</label>
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) => handleChange('medicalConditions', e.target.value)}
                    placeholder="e.g., Diabetes, Hypertension..."
                    className="input min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Allergies (Optional)</label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                    placeholder="e.g., Penicillin, Peanuts..."
                    className="input min-h-[80px]"
                  />
                </div>

                <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning flex-shrink-0">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <h4 className="font-medium text-warning mb-1">Privacy Notice</h4>
                      <p className="text-sm text-text-secondary">Patient information will be stored securely and used only for medical purposes. All data is protected under healthcare privacy regulations.</p>
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
                <Button variant="primary" onClick={() => setStep(2)}>
                  Next <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Patient'}
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
