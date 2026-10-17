import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth, UserRole } from '../../context/AuthContext'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user role is not allowed for this route
  if (!allowedRoles.includes(user.role)) {
    // Determine the safe destination for their legitimate dashboard
    const homeUrl =
      user.role === 'patient'
        ? '/portal/patient'
        : user.role === 'doctor'
        ? '/portal/doctor'
        : '/portal/receptionist'

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center space-y-6 border border-rose-200 dark:border-rose-900/60 shadow-xl bg-white dark:bg-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="badge badge-rose text-xs uppercase font-extrabold tracking-wider">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Unauthorized Clinical Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are currently logged in as a{' '}
              <strong className="text-slate-800 dark:text-slate-200 uppercase">{user.role}</strong> ({user.name}).
              This area is strictly restricted to authorized{' '}
              <strong className="text-rose-600 dark:text-rose-400">
                {allowedRoles.map(r => (r === 'patient' ? 'Patients' : r === 'doctor' ? 'Doctors' : 'Receptionists')).join(' / ')}
              </strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Role privacy isolation is enabled to protect patient confidentiality and clinical records.
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={homeUrl}
              className="btn btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Return to My Authorized Dashboard</span>
            </Link>
            <button
              onClick={logout}
              className="btn btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-600"
            >
              <LogOut size={15} />
              <span>Sign Out to Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
