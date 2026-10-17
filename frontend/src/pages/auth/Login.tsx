import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth, UserRole } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import MedicalLogo from '../../components/brand/MedicalLogo'
import { 
  User, 
  Stethoscope, 
  ClipboardList, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Phone,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck
} from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Default to User / Patient Portal as requested by user
  const initialRole = (searchParams.get('role') as UserRole) || 'patient'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign In Form Data (Empty by default — no fake demo data!)
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: '',
  })

  // Sign Up / Registration Form Data
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    phone: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    password: '',
  })

  const roleConfigs = {
    patient: {
      title: 'Patient Portal',
      subtitle: 'Self-service OPD booking, live queue tracker & digital WhatsApp reports',
      icon: User,
      color: 'from-cyan-600 to-teal-600',
      badge: 'Patient Self-Service',
      destination: '/portal/patient',
    },
    receptionist: {
      title: 'Receptionist Desk',
      subtitle: 'Manage OPD queue, call next tokens & check-in revisited patients',
      icon: ClipboardList,
      color: 'from-teal-600 to-emerald-600',
      badge: 'Staff Operations',
      destination: '/portal/receptionist',
    },
    doctor: {
      title: 'Doctor Workspace',
      subtitle: 'Consultation cabin, EHR history, vitals, prescriptions & repeat analytics',
      icon: Stethoscope,
      color: 'from-emerald-600 to-indigo-600',
      badge: 'Clinician Workspace',
      destination: '/portal/doctor',
    },
  }

  const currentConfig = roleConfigs[activeRole as keyof typeof roleConfigs] || roleConfigs.patient
  const RoleIcon = currentConfig.icon

  // Handle Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!signInData.identifier.trim()) {
      setError(activeRole === 'patient' ? 'Please enter your Mobile Number or Email.' : 'Please enter your Staff Email or ID.')
      return
    }

    setLoading(true)
    try {
      const loggedUser = await login(signInData.identifier, signInData.password, activeRole)
      addToast({
        title: `Welcome back, ${loggedUser.name}!`,
        message: `Signed in to ${currentConfig.title}.`,
        type: 'success',
      })
      if (loggedUser.role === 'patient') {
        navigate('/portal/patient')
      } else if (loggedUser.role === 'doctor') {
        navigate('/portal/doctor')
      } else {
        navigate('/portal/receptionist')
      }
    } catch {
      setError('Invalid credentials. Please verify your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign Up Submit (New Patient Registration)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!signUpData.fullName.trim() || !signUpData.phone.trim()) {
      setError('Please provide your Full Name and Mobile Number.')
      return
    }

    const cleanPhone = signUpData.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number for WhatsApp report delivery.')
      return
    }

    setLoading(true)
    try {
      const parsedAge = parseInt(signUpData.age, 10) || 32
      const newUser = await register(
        signUpData.fullName,
        cleanPhone,
        parsedAge,
        signUpData.gender,
        signUpData.password
      )
      addToast({
        title: `Account Created for ${newUser.name}!`,
        message: 'Your patient profile is active. You can now book appointment slots.',
        type: 'success',
      })
      navigate('/portal/patient')
    } catch {
      setError('Could not complete registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-500/10 dark:bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <div className="flex justify-center mb-6">
          <MedicalLogo to="/" subtitle="Smart Healthcare Operations" size="lg" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {authMode === 'signin' ? 'Sign In to Your Account' : 'New Patient Registration'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {authMode === 'signin' 
            ? 'Access your appointment bookings, track live queue turns, and download WhatsApp prescription reports.'
            : 'Create your digital healthcare profile to book doctor slots and receive automatic reports.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Role Selection Tabs (User / Patient suggested by default) */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 backdrop-blur rounded-2xl mb-6 shadow-inner border border-slate-300/60 dark:border-slate-700/60">
          {(['patient', 'receptionist', 'doctor'] as UserRole[]).map((role) => {
            const isSelected = activeRole === role
            const cfg = roleConfigs[role as keyof typeof roleConfigs]
            const Icon = cfg.icon
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setActiveRole(role)
                  setError('')
                  if (role !== 'patient') setAuthMode('signin')
                }}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-md scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                <span className="capitalize">{role === 'patient' ? 'User / Patient' : role}</span>
              </button>
            )
          })}
        </div>

        {/* Main Card with Glass Aesthetic */}
        <div className="card p-6 sm:p-8 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center text-white shadow-md`}>
                <RoleIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {currentConfig.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentConfig.subtitle}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block badge badge-teal">
              {currentConfig.badge}
            </span>
          </div>

          {/* Patient Auth Mode Switcher (Sign In vs Sign Up) */}
          {activeRole === 'patient' && (
            <div className="flex border-b border-slate-200 dark:border-slate-800 my-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setError('')
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                  authMode === 'signin'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LogIn size={16} />
                <span>Sign In (Existing Patient)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setError('')
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                  authMode === 'signup'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus size={16} />
                <span>Sign Up (New Patient Registration)</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* MODE 1: SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeRole === 'patient' ? 'Mobile Number or Email *' : 'Staff Email or ID *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {activeRole === 'patient' ? <Phone size={18} /> : <User size={18} />}
                  </div>
                  <input
                    type="text"
                    required
                    value={signInData.identifier}
                    onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                    placeholder={
                      activeRole === 'patient'
                        ? 'Enter 10-digit mobile (e.g. 98450 12345) or email'
                        : activeRole === 'doctor'
                        ? 'doctor@clinicqueue.com'
                        : 'reception@clinicqueue.com'
                    }
                    className="input pl-11 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password / Access PIN *
                  </label>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {activeRole === 'patient' ? '4-digit PIN or password' : 'Staff Master Password'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    placeholder="Enter password or PIN..."
                    className="input pl-11 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing in securely...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign In to {currentConfig.title}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {activeRole === 'patient' && (
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    First time visiting Shanti Ayush Clinic?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Sign Up as New Patient
                    </button>
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* MODE 2: SIGN UP / NEW PATIENT REGISTRATION */
            <form onSubmit={handleSignUp} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Pujari"
                    className="input pl-11 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (For WhatsApp Reports) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    placeholder="e.g. 98450 12345"
                    className="input pl-11 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                </div>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Your prescription & live token alerts will be dispatched directly to this WhatsApp number.</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={signUpData.age}
                    onChange={(e) => setSignUpData({ ...signUpData, age: e.target.value })}
                    placeholder="e.g. 35"
                    className="input text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as any })}
                    className="input text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Create Password / PIN *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="Create a 4-digit PIN or password..."
                    className="input pl-11 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating your patient account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Complete Registration & Open Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Security & Confidentiality Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>NABH Compliant Data Protection</span>
            </span>
            <Link to="/" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
              ← Back to Clinic Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
