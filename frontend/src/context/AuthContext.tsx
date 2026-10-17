import { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'owner' | 'receptionist' | 'doctor' | 'patient'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  clinicId: string
  specialty?: string
  room?: string
  phone?: string
  tokenNumber?: number
  age?: number
  gender?: 'Male' | 'Female' | 'Other'
  password?: string
}

interface AuthContextType {
  user: User | null
  login: (emailOrPhone: string, password?: string, selectedRole?: UserRole) => Promise<User>
  register: (name: string, phone: string, age?: number, gender?: string, password?: string) => Promise<User>
  quickLogin: (role: UserRole) => void
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const DEMO_USERS: Record<UserRole, User> = {
  patient: {
    id: 'usr-patient-1',
    name: 'Suresh Kumar',
    email: 'patient@clinicqueue.com',
    role: 'patient',
    clinicId: 'clinic-1',
    phone: '9845044444',
    tokenNumber: 101,
  },
  receptionist: {
    id: 'usr-reception-1',
    name: 'Pooja Patil',
    email: 'reception@clinicqueue.com',
    role: 'receptionist',
    clinicId: 'clinic-1',
  },
  doctor: {
    id: 'usr-doc-1',
    name: 'Dr. Ramesh Hegde',
    email: 'doctor@clinicqueue.com',
    role: 'doctor',
    clinicId: 'clinic-1',
    specialty: 'Senior Physician & Diabetologist',
    room: 'Consultation Room 1',
  },
  owner: {
    id: 'usr-owner-1',
    name: 'Dr. Ramesh Hegde',
    email: 'owner@clinicqueue.com',
    role: 'owner',
    clinicId: 'clinic-1',
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch {
        return null
      }
    }
    // Fully real: Unauthenticated by default until user signs in!
    return null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const quickLogin = (role: UserRole) => {
    const targetUser = DEMO_USERS[role]
    setUser(targetUser)
    localStorage.setItem('user', JSON.stringify(targetUser))
  }

  const getRegisteredUsers = (): User[] => {
    try {
      const saved = localStorage.getItem('clinic_registered_users')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const saveRegisteredUser = (newUser: User) => {
    try {
      const list = getRegisteredUsers()
      const filtered = list.filter(u => u.phone !== newUser.phone && u.id !== newUser.id)
      localStorage.setItem('clinic_registered_users', JSON.stringify([newUser, ...filtered]))
    } catch {}
  }

  const syncNewPatientToClinicDatabase = (newUser: User) => {
    try {
      const saved = localStorage.getItem('clinic_patients')
      const list = saved ? JSON.parse(saved) : []
      const cleanPhone = newUser.phone?.replace(/\D/g, '') || ''
      const existsIndex = list.findIndex((p: any) => p.phone && p.phone.replace(/\D/g, '') === cleanPhone)
      if (existsIndex === -1) {
        const newProf = {
          id: newUser.id,
          mrn: `MRN-${cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`,
          name: newUser.name,
          phone: newUser.phone || '',
          age: newUser.age || 30,
          gender: newUser.gender || 'Male',
          bloodGroup: 'Not Recorded',
          allergies: [],
          totalVisits: 0,
          firstVisitDate: 'Not yet visited',
          lastVisitDate: 'None',
          visits: [],
        }
        localStorage.setItem('clinic_patients', JSON.stringify([newProf, ...list]))
      } else {
        list[existsIndex].name = newUser.name
        list[existsIndex].age = newUser.age || list[existsIndex].age
        list[existsIndex].gender = newUser.gender || list[existsIndex].gender
        localStorage.setItem('clinic_patients', JSON.stringify(list))
      }
    } catch {}
  }

  const register = async (name: string, phone: string, _age = 30, _gender = 'Male', _password = ''): Promise<User> => {
    setLoading(true)
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        const cleanPhone = phone.trim().replace(/\D/g, '')
        const newUser: User = {
          id: `usr-pat-${Date.now()}`,
          name: name.trim(),
          email: `${cleanPhone || 'user'}@clinicqueue.com`,
          role: 'patient',
          clinicId: 'clinic-1',
          phone: cleanPhone || phone.trim(),
          tokenNumber: undefined, // Pristine: First-time user does not have a queue token yet!
          age: _age,
          gender: _gender as 'Male' | 'Female' | 'Other',
          password: _password ? _password.trim() : '',
        }
        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
        saveRegisteredUser(newUser)
        syncNewPatientToClinicDatabase(newUser)
        setLoading(false)
        resolve(newUser)
      }, 400)
    })
  }

  const login = async (emailOrPhone: string, _password = '', selectedRole: UserRole = 'patient'): Promise<User> => {
    setLoading(true)
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        const input = emailOrPhone.trim().toLowerCase()
        let matchedUser: User | null = null

        if (selectedRole === 'patient') {
          // Real patient login by mobile number or email
          const cleanPhone = input.replace(/\D/g, '')
          const registered = getRegisteredUsers()
          const previouslyRegistered = registered.find(u =>
            (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === cleanPhone) ||
            (u.email && u.email.toLowerCase() === input)
          )

          if (previouslyRegistered) {
            // Verify password if user configured a password during signup
            if (previouslyRegistered.password && _password.trim()) {
              if (previouslyRegistered.password !== _password.trim()) {
                setLoading(false)
                reject(new Error('INCORRECT_PASSWORD'))
                return
              }
            }

            matchedUser = {
              ...previouslyRegistered,
              tokenNumber: undefined, // Check live queue for active tokens
            }
          } else if (cleanPhone === '9845044444' || input === 'patient@clinicqueue.com') {
            // Suresh Kumar Demo Patient
            matchedUser = {
              ...DEMO_USERS.patient,
              tokenNumber: 103,
            }
          } else {
            // Reject un-registered logins: User MUST sign up first to create their record!
            setLoading(false)
            reject(new Error('ACCOUNT_NOT_FOUND'))
            return
          }
        } else if (selectedRole === 'doctor') {
          // Doctor login
          matchedUser = {
            ...DEMO_USERS.doctor,
            email: input || DEMO_USERS.doctor.email,
          }
        } else {
          // Receptionist login
          matchedUser = {
            ...DEMO_USERS.receptionist,
            email: input || DEMO_USERS.receptionist.email,
          }
        }

        if (matchedUser) {
          setUser(matchedUser)
          localStorage.setItem('user', JSON.stringify(matchedUser))
          setLoading(false)
          resolve(matchedUser)
        } else {
          setLoading(false)
          reject(new Error('Invalid credentials'))
        }
      }, 400)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    register,
    quickLogin,
    logout,
    isAuthenticated: user !== null,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
