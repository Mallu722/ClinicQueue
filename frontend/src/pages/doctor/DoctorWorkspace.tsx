import { motion } from 'framer-motion'
import { 
  User, 
  Clock, 
  CheckCircle, 
  MoreVertical
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'

interface Visit {
  id: string
  patientName: string
  patientPhone: string
  appointmentTime: string
  reason: string
  diagnosis?: string
  prescription?: string[]
  status: 'pending' | 'in-progress' | 'completed'
}

const mockVisits: Visit[] = [
  { id: '1', patientName: 'Ramesh Kumar', patientPhone: '9876543210', appointmentTime: '09:00 AM', reason: 'Regular checkup', status: 'completed', diagnosis: 'Hypertension controlled', prescription: ['Amlodipine 5mg', 'Metformin 500mg'] },
  { id: '2', patientName: 'Sita Devi', patientPhone: '9876543211', appointmentTime: '09:30 AM', reason: 'Fever and cough', status: 'in-progress' },
  { id: '3', patientName: 'Mohan Singh', patientPhone: '9876543212', appointmentTime: '10:00 AM', reason: 'Follow-up', status: 'pending' },
  { id: '4', patientName: 'Priya Patel', patientPhone: '9876543213', appointmentTime: '11:00 AM', reason: 'Blood pressure check', status: 'pending' },
]

export default function DoctorWorkspace() {
  const pendingCount = mockVisits.filter(v => v.status === 'pending').length
  const inProgressCount = mockVisits.filter(v => v.status === 'in-progress').length
  const completedCount = mockVisits.filter(v => v.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctor Workspace</h1>
          <p className="text-text-secondary">Manage consultations and patient records</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Today's Consultations ({mockVisits.length})</h2>
        
        <div className="grid gap-4">
          {mockVisits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {}}
              className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    visit.status === 'pending' ? 'bg-primary-50 text-primary-600' :
                    visit.status === 'in-progress' ? 'bg-warning-50 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    <span className="text-sm font-medium">{visit.appointmentTime}</span>
                    <Clock size={20} className="mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{visit.patientName}</h3>
                    <p className="text-sm text-text-secondary">{visit.patientPhone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{visit.reason}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={visit.status === 'completed' ? 'success' : visit.status === 'in-progress' ? 'warning' : 'default'}>
                    {visit.status === 'completed' ? 'Completed' : visit.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Patient Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">In Progress</p>
                <p className="text-3xl font-bold text-warning mt-1">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-warning/50 rounded-lg flex items-center justify-center text-warning">
                <User size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Completed</p>
                <p className="text-3xl font-bold text-success mt-1">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-success/50 rounded-lg flex items-center justify-center text-success">
                <CheckCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Patients</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{mockVisits.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <User size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToastContainer />
    </div>
  )
}
