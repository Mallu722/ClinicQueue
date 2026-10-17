import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PortalIndex() {
  const { user } = useAuth()

  if (user?.role === 'patient') {
    return <Navigate to="/portal/patient" replace />
  }

  if (user?.role === 'doctor') {
    return <Navigate to="/portal/doctor" replace />
  }

  return <Navigate to="/portal/receptionist" replace />
}
