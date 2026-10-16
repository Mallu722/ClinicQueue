import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  CheckCircle, 
  Clock, 
  MoreVertical,
  Search,
  User
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'
import { useToast } from '../../context/ToastContext'

interface QueueEntry {
  id: string
  tokenNumber: number
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: string
  appointmentId?: string
  status: 'waiting' | 'in-consultation' | 'completed' | 'skipped' | 'cancelled'
  queuePosition: number
  waitTimeStart: Date
  doctorName: string
  reason?: string
}

const mockQueue: QueueEntry[] = [
  {
    id: '1',
    tokenNumber: 101,
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientAge: 45,
    patientGender: 'Male',
    status: 'waiting',
    queuePosition: 1,
    waitTimeStart: new Date(Date.now() - 15 * 60000),
    doctorName: 'Dr. Smith',
    reason: 'Regular checkup'
  },
  {
    id: '2',
    tokenNumber: 102,
    patientName: 'Sita Devi',
    patientPhone: '9876543211',
    patientAge: 32,
    patientGender: 'Female',
    status: 'in-consultation',
    queuePosition: 2,
    waitTimeStart: new Date(Date.now() - 10 * 60000),
    doctorName: 'Dr. Smith',
    reason: 'Fever and cough'
  },
  {
    id: '3',
    tokenNumber: 103,
    patientName: 'Mohan Singh',
    patientPhone: '9876543212',
    patientAge: 28,
    patientGender: 'Male',
    status: 'waiting',
    queuePosition: 3,
    waitTimeStart: new Date(Date.now() - 30 * 60000),
    doctorName: 'Dr. Johnson',
    reason: 'Follow-up'
  },
  {
    id: '4',
    tokenNumber: 104,
    patientName: 'Priya Patel',
    patientPhone: '9876543213',
    patientAge: 52,
    patientGender: 'Female',
    status: 'waiting',
    queuePosition: 4,
    waitTimeStart: new Date(Date.now() - 25 * 60000),
    doctorName: 'Dr. Johnson',
    reason: 'Blood pressure check'
  },
  {
    id: '5',
    tokenNumber: 105,
    patientName: 'Arun Sharma',
    patientPhone: '9876543214',
    patientAge: 61,
    patientGender: 'Male',
    status: 'waiting',
    queuePosition: 5,
    waitTimeStart: new Date(Date.now() - 45 * 60000),
    doctorName: 'Dr. Smith',
    reason: 'Diabetes follow-up'
  }
]

function formatTime(minutes: number): string {
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

export default function QueuePage() {
  const { addToast } = useToast()
  const [queue, setQueue] = useState(mockQueue)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleCallNext = () => {
    const waiting = queue.filter(q => q.status === 'waiting')
    if (waiting.length > 0) {
      const nextPatient = waiting[0]
      addToast({
        title: 'Patient Called',
        message: `Token #${nextPatient.tokenNumber} - ${nextPatient.patientName}`,
        type: 'success'
      })
      
      setQueue(prev => prev.map(q => 
        q.id === nextPatient.id 
          ? { ...q, status: 'in-consultation' as const }
          : q
      ))
    }
  }

  const handleStartConsultation = (id: string) => {
    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'in-consultation' as const } : q
    ))
    addToast({
      title: 'Consultation Started',
      type: 'success'
    })
  }

  const handleCompleteVisit = (id: string) => {
    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'completed' as const } : q
    ))
    addToast({
      title: 'Visit Completed',
      type: 'success'
    })
  }

  const filteredQueue = queue.filter(q => {
    const matchesSearch = q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.patientPhone.includes(searchQuery) ||
                          q.tokenNumber.toString().includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const waitingCount = queue.filter(q => q.status === 'waiting').length
  const inConsultationCount = queue.filter(q => q.status === 'in-consultation').length
  const completedCount = queue.filter(q => q.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Queue Management</h1>
          <p className="text-text-secondary">Real-time queue status and patient flow</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Search size={18} />}>
            Search Queue
          </Button>
          <Button variant="primary" onClick={handleCallNext} icon={<Phone size={18} />}>
            Call Next
          </Button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Waiting</p>
                <p className="text-3xl font-bold text-warning mt-1">{waitingCount}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center text-warning">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">In Consultation</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{inConsultationCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <User size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Completed Today</p>
                <p className="text-3xl font-bold text-success mt-1">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center text-success">
                <CheckCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by token, name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full md:w-80"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'waiting', 'in-consultation', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-background-card text-text-secondary hover:bg-background-border'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {filteredQueue.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                    entry.status === 'waiting' ? 'bg-warning/20 text-warning' :
                    entry.status === 'in-consultation' ? 'bg-primary-100 text-primary-600' :
                    'bg-success/10 text-success'
                  }`}>
                    #{entry.tokenNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{entry.patientName}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Age:</span> {entry.patientAge} {entry.patientGender}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Dr:</span> {entry.doctorName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={entry.status === 'waiting' ? 'warning' : 
                              entry.status === 'in-consultation' ? 'primary' : 
                              entry.status === 'completed' ? 'success' : 'outline'}
                    >
                      {entry.status === 'waiting' ? 'Waiting' : 
                       entry.status === 'in-consultation' ? 'In Consultation' : 
                       entry.status === 'completed' ? 'Completed' : 'Skipped'}
                    </Badge>
                    {entry.status === 'waiting' && (
                      <span className="text-xs text-text-secondary">
                        Position: #{entry.queuePosition}
                      </span>
                    )}
                  </div>

                  {entry.status === 'waiting' && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock size={12} />
                      <span>Waited: {formatTime((Date.now() - entry.waitTimeStart.getTime()) / 60000)}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    {entry.status === 'waiting' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStartConsultation(entry.id)}>
                        Start Consultation
                      </Button>
                    )}
                    {entry.status === 'in-consultation' && (
                      <Button variant="success" size="sm" onClick={() => handleCompleteVisit(entry.id)}>
                        Complete Visit
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="More options">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredQueue.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-background-card rounded-full mb-4">
              <Search size={32} className="text-text-secondary" />
            </div>
            <p className="text-text-secondary">No queue entries found</p>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  )
}
