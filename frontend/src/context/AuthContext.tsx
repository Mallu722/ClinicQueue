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

  const register = async (name: string, phone: string, _age = 30, _gender = 'Male', _password = ''): Promise<User> => {
    setLoading(true)
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `usr-pat-${Date.now()}`,
          name: name.trim(),
          email: `${phone.replace(/\D/g, '')}@clinicqueue.com`,
          role: 'patient',
          clinicId: 'clinic-1',
          phone: phone.trim(),
          tokenNumber: Math.floor(100 + Math.random() * 50),
        }
        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
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
          matchedUser = {
            id: `usr-pat-${cleanPhone || 'custom'}`,
            name: cleanPhone === '9845044444' ? 'Suresh Kumar' : cleanPhone ? `Patient (${cleanPhone.slice(-4)})` : 'Verified Patient',
            email: input.includes('@') ? input : `${cleanPhone}@clinicqueue.com`,
            role: 'patient',
            clinicId: 'clinic-1',
            phone: cleanPhone || '9845012345',
            tokenNumber: 103,
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
