import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  BarChart3,
  LogOut,
  Menu,
  X,
  Globe,
  Activity,
  ExternalLink,
  Moon,
  Sun
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { name: 'Queue', href: '/portal/queue', icon: Calendar },
  { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'Patients', href: '/portal/patients', icon: Users },
  { name: 'Doctor Workspace', href: '/portal/doctor', icon: User },
  { name: 'Analytics', href: '/portal/analytics', icon: BarChart3 },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'hi', name: 'HI' },
    { code: 'kn', name: 'KN' },
  ] as const

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-soft transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/portal" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity size={18} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              ClinicQueue
            </span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-2 mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operations</p>
          </div>
          {navigation.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          <div className="pt-6 px-2 mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Public Portal</p>
          </div>
          <Link
            to="/public"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/70 transition-colors text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <Globe size={18} />
              <span>Public Website</span>
            </span>
            <ExternalLink size={14} />
          </Link>
          <Link
            to="/public/tv"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Activity size={18} className="text-slate-400" />
            <span>TV Waiting Display</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {location.pathname === '/portal' ? 'Receptionist & Owner Dashboard' : 
                 location.pathname.includes('/queue') ? 'Live Queue Management' :
                 location.pathname.includes('/appointments') ? 'Doctor Appointments' :
                 location.pathname.includes('/patients') ? 'Patient Directory' :
                 location.pathname.includes('/doctor') ? 'Doctor Workspace & Prescriptions' :
                 location.pathname.includes('/analytics') ? 'Clinic Analytics' :
                 'Clinic Operations'}
              </h1>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                Shanti Ayush Health Clinic • Pilot Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    language === l.code ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'Dr. Ramesh Hegde'}</p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 uppercase font-semibold">{user?.role || 'Clinician'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                {(user?.name || 'D').charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
