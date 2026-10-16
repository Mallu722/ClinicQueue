import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  Search,
  Plus,
  Phone,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'
import { useToast } from '../../context/ToastContext'

interface Patient {
  id: string
  name: string
  phone: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  status: 'waiting' | 'in-consultation' | 'completed' | 'skipped'
}

interface Appointment {
  id: string
  patientName: string
  doctorName: string
  time: string
  type: 'scheduled' | 'walk-in'
  status: 'confirmed' | 'pending' | 'cancelled'
}

const mockPatients: Patient[] = [
  { id: '1', name: 'Ramesh Kumar', phone: '9876543210', age: 45, gender: 'Male', status: 'waiting' },
  { id: '2', name: 'Sita Devi', phone: '9876543211', age: 32, gender: 'Female', status: 'in-consultation' },
  { id: '3', name: 'Mohan Singh', phone: '9876543212', age: 28, gender: 'Male', status: 'completed' },
  { id: '4', name: 'Priya Patel', phone: '9876543213', age: 52, gender: 'Female', status: 'waiting' },
  { id: '5', name: 'Arun Sharma', phone: '9876543214', age: 61, gender: 'Male', status: 'waiting' },
]

const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Ramesh Kumar', doctorName: 'Dr. Smith', time: '09:00 AM', type: 'scheduled', status: 'confirmed' },
  { id: '2', patientName: 'Sita Devi', doctorName: 'Dr. Smith', time: '10:30 AM', type: 'walk-in', status: 'pending' },
  { id: '3', patientName: 'Mohan Singh', doctorName: 'Dr. Johnson', time: '11:00 AM', type: 'scheduled', status: 'confirmed' },
]

export default function Dashboard() {
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [queueStatus, setQueueStatus] = useState(mockPatients)

  const handleCallNext = () => {
    const waitingPatients = queueStatus.filter(p => p.status === 'waiting')
    if (waitingPatients.length > 0) {
      addToast({
        title: 'Patient Called',
        message: `Calling ${waitingPatients[0].name} (Token #${waitingPatients.length})`,
        type: 'success'
      })
      
      setQueueStatus(prev => prev.map(p => 
        p.id === waitingPatients[0].id 
          ? { ...p, status: 'in-consultation' as const }
          : p
      ))
    } else {
      addToast({
        title: 'No patients waiting',
        message: 'All patients have been seen',
        type: 'info'
      })
    }
  }

  const filteredPatients = queueStatus.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Plus size={18} />}>
            Add Patient
          </Button>
          <Button variant="secondary" icon={<Calendar size={18} />}>
            Book Appointment
          </Button>
          <Button variant="secondary" icon={<Phone size={18} />}>
            Add Walk-in
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Patients Today</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">48</p>
                  <p className="text-xs text-success mt-1">↑ 12% from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <Users size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Waiting Now</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">3</p>
                  <p className="text-xs text-warning mt-1">3 patients waiting</p>
                </div>
                <div className="w-12 h-12 bg-warning/50 rounded-xl flex items-center justify-center text-warning">
                  <Clock size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">In Consultation</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">1</p>
                  <p className="text-xs text-primary-600 mt-1">Currently with doctor</p>
                </div>
                <div className="w-12 h-12 bg-healthcare-teal/50 rounded-xl flex items-center justify-center text-healthcare-teal">
                  <CheckCircle size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Completed</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">32</p>
                  <p className="text-xs text-success mt-1">Today's visits</p>
                </div>
                <div className="w-12 h-12 bg-success/50 rounded-xl flex items-center justify-center text-success">
                  <Calendar size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Live Queue</h2>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
          </div>

          <div className="grid gap-3">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      patient.status === 'waiting' ? 'bg-primary-50 text-primary-600' :
                      patient.status === 'in-consultation' ? 'bg-healthcare-teal-50 text-healthcare-teal' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary">{patient.name}</h3>
                      <p className="text-sm text-text-secondary">
                        {patient.phone} • {patient.age} years • {patient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={patient.status === 'waiting' ? 'default' : 
                              patient.status === 'in-consultation' ? 'success' : 'outline'}
                    >
                      {patient.status === 'waiting' ? 'Waiting' : 
                       patient.status === 'in-consultation' ? 'In Consultation' : 'Completed'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-background-card rounded-full mb-4">
                <Search size={32} className="text-text-secondary" />
              </div>
              <p className="text-text-secondary">No patients found</p>
            </div>
          )}

          {/* Queue Controls */}
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              className="flex-1 py-4 text-lg"
              onClick={handleCallNext}
            >
              <Phone size={20} className="mr-2" />
              Call Next Patient
            </Button>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Today's Appointments</h2>
          <div className="space-y-3">
            {mockAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-text-primary">{appointment.patientName}</h4>
                      <span className="text-sm font-medium text-text-secondary">{appointment.time}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{appointment.doctorName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'}>
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {appointment.type === 'scheduled' ? 'Scheduled' : 'Walk-in'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="font-medium text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6">
                <Users size={24} className="text-text-secondary" />
                <span className="text-sm">Add Patient</span>
              </Button>
              <Button variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6">
                <Calendar size={24} className="text-text-secondary" />
                <span className="text-sm">Book Appt</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
