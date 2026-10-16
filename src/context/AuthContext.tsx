import { createContext, useContext, useEffect, useState } from 'react'

type UserRole = 'owner' | 'receptionist' | 'doctor' | 'patient'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  clinicId: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock authentication
    setLoading(true)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@clinicqueue.com' && password === 'demo') {
          const mockUser: User = {
            id: '1',
            name: 'Dr. Smith',
            email: 'demo@clinicqueue.com',
            role: 'receptionist',
            clinicId: 'clinic-1',
          }
          setUser(mockUser)
          localStorage.setItem('user', JSON.stringify(mockUser))
          setLoading(false)
          resolve()
        } else {
          setLoading(false)
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
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
