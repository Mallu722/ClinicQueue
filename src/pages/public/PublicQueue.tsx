import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Phone, 
  Clock,
  Calendar,
  CheckCircle,
  Info
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ToastContainer } from '../../context/ToastContext'
import { useToast } from '../../context/ToastContext'

interface QueueStatus {
  currentToken: number
  nextToken: number
  status: 'waiting' | 'in-consultation' | 'completed'
  estimatedWaitTime: string
  lastUpdated: string
  consultationDuration: number
  patientsAhead: number
}

const mockQueueStatus: QueueStatus = {
  currentToken: 102,
  nextToken: 103,
  status: 'in-consultation',
  estimatedWaitTime: '15-20 minutes',
  lastUpdated: 'Just now',
  consultationDuration: 25,
  patientsAhead: 2
}

export default function PublicQueue() {
  const { addToast } = useToast()
  const [tokenNumber, setTokenNumber] = useState('')
  const [status, setStatus] = useState<'check' | 'display' | null>(null)
  const [patientInfo, setPatientInfo] = useState<Record<string, unknown> | null>(null)

  const handleCheckStatus = () => {
    if (!tokenNumber) {
      addToast({
        title: 'Please enter a token number',
        type: 'error'
      })
      return
    }
    
    setStatus('display')
    setPatientInfo({
      name: 'Ramesh Kumar',
      tokenNumber: 101,
      status: 'waiting',
      estimatedWaitTime: '15-20 minutes',
      position: 3,
      doctor: 'Dr. Smith',
      reason: 'Regular checkup'
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-text-primary mb-4">Patient Queue Status</h1>
        <p className="text-xl text-text-secondary">Check your position in the queue and estimated waiting time</p>
      </motion.div>

      {/* Quick Status Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Enter your token number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  placeholder="e.g., 101"
                  className="input pl-4 text-2xl py-3"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckStatus()}
                />
                <button
                  onClick={handleCheckStatus}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700"
                >
                  <Search size={24} />
                </button>
              </div>
            </div>
            <Button variant="primary" onClick={handleCheckStatus} className="py-3 px-8 text-lg">
              Check Status
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Queue Status Display */}
      {status === 'display' && patientInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Patient Token Card */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary-50 to-healthcare-teal-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-text-secondary uppercase tracking-wider mb-2">Your Token Number</p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-soft">
                    <span className="text-4xl md:text-5xl font-bold text-text-primary">#{patientInfo.tokenNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-text-primary">{patientInfo.name}</h3>
                <p className="text-text-secondary mt-1">
                  Doctor: {patientInfo.doctor}
                </p>
                <p className="text-text-secondary text-sm">
                  Reason: {patientInfo.reason}
                </p>
              </div>
              <Badge 
                variant={patientInfo.status === 'waiting' ? 'warning' : 'success'}
                className="text-lg px-6 py-3"
              >
                {patientInfo.status === 'waiting' ? 'Waiting' : 
                 patientInfo.status === 'in-consultation' ? 'In Consultation' : 'Completed'}
              </Badge>
            </div>
          </Card>

          {/* Status Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                  <Clock size={20} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Estimated Wait</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{patientInfo.estimatedWaitTime}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning-50 rounded-lg text-warning">
                  <Calendar size={20} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Position</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">#{patientInfo.position} of {patientInfo.position + 5}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success-50 rounded-lg text-success">
                  <Phone size={20} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Status</span>
              </div>
              <p className="text-lg font-medium text-text-primary">
                <span className="text-success">●</span> Active Queue
              </p>
            </Card>
          </div>

          {/* Current Doctor Status */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-healthcare-teal rounded-xl flex items-center justify-center text-white">
                <span className="text-2xl font-bold">DS</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  Currently with: Dr. Smith
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-text-secondary">Consultation in progress</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-primary-50 p-4 rounded-lg flex items-start gap-3">
            <Info size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-primary font-medium mb-1">Waiting for your turn?</p>
              <p className="text-sm text-text-secondary">
                You will be called soon. Please wait near the consultation room. If you need assistance, press the call button at the reception.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Queue Status (Public Info) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning-50 rounded-lg text-warning">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Current Status</h3>
              <p className="text-sm text-text-secondary">Last updated: {mockQueueStatus.lastUpdated}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg">
              <div>
                <p className="text-sm text-text-secondary">Currently with</p>
                <p className="text-xl font-bold text-text-primary">
                  Token #{mockQueueStatus.currentToken}
                </p>
              </div>
              <span className="text-warning font-medium px-3 py-1 bg-white rounded-full shadow-sm">
                In Consultation
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="text-sm text-text-secondary">Next up</p>
                <p className="text-xl font-bold text-text-primary">
                  Token #{mockQueueStatus.nextToken}
                </p>
              </div>
              <span className="text-primary-600 font-medium px-3 py-1 bg-white rounded-full shadow-sm">
                Waiting
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success-50 rounded-lg text-success">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Estimated Wait Time</h3>
              <p className="text-sm text-text-secondary">Based on current queue</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-6">
              <span className="text-4xl font-bold text-text-primary block mb-2">
                {mockQueueStatus.estimatedWaitTime}
              </span>
              <span className="text-sm text-text-secondary">
                Average consultation time: {mockQueueStatus.consultationDuration} minutes
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      <ToastContainer />
    </div>
  )
}
