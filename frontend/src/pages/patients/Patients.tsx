import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Users,
  History,
  Phone,
  Calendar
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'

interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  lastVisit?: string
  totalVisits: number
  status: 'active' | 'inactive'
}

const mockPatients: Patient[] = [
  { id: '1', name: 'Ramesh Kumar', phone: '9876543210', age: 45, gender: 'Male', lastVisit: '2024-01-15', totalVisits: 5, status: 'active' },
  { id: '2', name: 'Sita Devi', phone: '9876543211', age: 32, gender: 'Female', lastVisit: '2024-01-14', totalVisits: 3, status: 'active' },
  { id: '3', name: 'Mohan Singh', phone: '9876543212', age: 28, gender: 'Male', lastVisit: '2024-01-10', totalVisits: 2, status: 'active' },
  { id: '4', name: 'Priya Patel', phone: '9876543213', age: 52, gender: 'Female', lastVisit: '2024-01-12', totalVisits: 8, status: 'active' },
  { id: '5', name: 'Arun Sharma', phone: '9876543214', age: 61, gender: 'Male', lastVisit: '2024-01-08', totalVisits: 12, status: 'active' },
]

export default function Patients() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredPatients = mockPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.phone.includes(searchQuery) ||
                          p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Patients</h1>
          <p className="text-text-secondary">Manage patient records and visit history</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/patients/register')} icon={<Plus size={18} />}>
          Add Patient
        </Button>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Patients</p>
                <p className="text-3xl font-bold text-text-primary mt-1">1248</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Patients</p>
                <p className="text-3xl font-bold text-success mt-1">982</p>
              </div>
              <div className="w-12 h-12 bg-success/50 rounded-lg flex items-center justify-center text-success">
                <Phone size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New This Month</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">45</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'active', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-background-card text-text-secondary hover:bg-background-border'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => null}
            className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-healthcare-teal flex items-center justify-center text-white font-bold text-lg">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{patient.name}</h3>
                  <p className="text-sm text-text-secondary">{patient.age} years • {patient.gender}</p>
                </div>
              </div>
              <Badge variant={patient.status === 'active' ? 'success' : 'outline'}>
                {patient.status}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone size={14} />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-background-border">
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <Calendar size={14} />
                <span>Last: {patient.lastVisit || 'Never'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <History size={14} />
                <span>{patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-background-card rounded-full mb-4">
            <Search size={32} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary">No patients found</p>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
