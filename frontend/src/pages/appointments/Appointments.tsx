import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  MoreVertical
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  doctorName: string
  scheduledTime: string
  scheduledDate: string
  type: 'scheduled' | 'walk-in'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  duration: string
  notes?: string
}

const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Ramesh Kumar', patientPhone: '9876543210', doctorName: 'Dr. Smith', scheduledTime: '09:00 AM', scheduledDate: 'Today', type: 'scheduled', status: 'confirmed', duration: '30 min' },
  { id: '2', patientName: 'Sita Devi', patientPhone: '9876543211', doctorName: 'Dr. Smith', scheduledTime: '09:30 AM', scheduledDate: 'Today', type: 'walk-in', status: 'pending', duration: '15 min' },
  { id: '3', patientName: 'Mohan Singh', patientPhone: '9876543212', doctorName: 'Dr. Johnson', scheduledTime: '10:00 AM', scheduledDate: 'Today', type: 'scheduled', status: 'confirmed', duration: '30 min' },
  { id: '4', patientName: 'Priya Patel', patientPhone: '9876543213', doctorName: 'Dr. Johnson', scheduledTime: '11:00 AM', scheduledDate: 'Today', type: 'scheduled', status: 'confirmed', duration: '30 min' },
  { id: '5', patientName: 'Arun Sharma', patientPhone: '9876543214', doctorName: 'Dr. Smith', scheduledTime: '02:00 PM', scheduledDate: 'Today', type: 'walk-in', status: 'pending', duration: '15 min' },
  { id: '6', patientName: 'Lakshmi R.', patientPhone: '9876543215', doctorName: 'Dr. Smith', scheduledTime: '03:30 PM', scheduledDate: 'Today', type: 'scheduled', status: 'confirmed', duration: '30 min' },
]

export default function Appointments() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredAppointments = mockAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.patientPhone.includes(searchQuery) ||
                          apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success'
      case 'pending': return 'bg-warning/10 text-warning'
      case 'cancelled': return 'bg-error/10 text-error'
      case 'completed': return 'bg-primary-50 text-primary-600'
      case 'no-show': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'pending': return 'Pending'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      case 'no-show': return 'No Show'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-text-secondary">Manage patient appointments and schedules</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/appointments/book')} icon={<Plus size={18} />}>
          Book Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'cancelled'].map(status => (
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
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex flex-col items-center justify-center text-primary-600">
                  <span className="text-sm font-medium">{appointment.scheduledDate}</span>
                  <span className="text-lg font-bold">{appointment.scheduledTime}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-lg">{appointment.patientName}</h3>
                  <p className="text-sm text-text-secondary">{appointment.patientPhone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{appointment.doctorName}</Badge>
                    <Badge variant="outline">{appointment.duration}</Badge>
                    <Badge variant={appointment.type === 'scheduled' ? 'default' : 'outline'}>
                      {appointment.type === 'scheduled' ? 'Scheduled' : 'Walk-in'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-background-card rounded-full mb-4">
            <Search size={32} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary">No appointments found</p>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
