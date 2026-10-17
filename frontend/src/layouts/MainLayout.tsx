import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useClinic } from '../context/ClinicContext'
import MedicalLogo from '../components/brand/MedicalLogo'
import {
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Globe,
  Activity,
  ExternalLink,
  Moon,
  Sun,
  Stethoscope,
  ClipboardList,
  ShieldCheck,
  Clock,
  FileText,
  HelpCircle
} from 'lucide-react'
import { useState } from 'react'

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme()
  const { currentServingToken } = useClinic()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'hi', name: 'HI' },
    { code: 'kn', name: 'KN' },
  ] as const

  // Role-specific navigation items - strictly isolated
  const patientNavItems = [
    {
      name: 'Doctor Directory & Booking',
      href: '/portal/patient',
      icon: Stethoscope,
      badge: 'Available',
    },
    {
      name: 'Live Queue & Turn Tracker',
      href: '/portal/patient/queue',
      icon: Clock,
      badge: 'Order',
    },
    {
      name: 'Past Visits & Prescriptions',
      href: '/portal/patient/history',
      icon: FileText,
      badge: 'Tablets',
    },
    {
      name: 'Clinic Guide & SOS Helpline',
      href: '/portal/patient/help',
      icon: HelpCircle,
      badge: '24/7',
    },
  ]

  const receptionistNavItems = [
    {
      name: 'Queue & Token Calling',
      href: '/portal/receptionist',
      icon: ClipboardList,
      badge: 'Live Desk',
    },
    {
      name: 'Patient Directory',
      href: '/portal/patients',
      icon: Users,
      badge: 'Records',
    },
  ]

  const doctorNavItems = [
    {
      name: 'Consultation & Rx Writer',
      href: '/portal/doctor',
      icon: Stethoscope,
      badge: 'Cabin',
    },
    {
      name: 'Clinical Analytics & Trends',
      href: '/portal/analytics',
      icon: BarChart3,
      badge: 'Graphs',
    },
    {
      name: 'Patient EHR Directory',
      href: '/portal/patients',
      icon: Users,
      badge: 'History',
    },
  ]

  const activeNavItems =
    user?.role === 'patient'
      ? patientNavItems
      : user?.role === 'doctor'
      ? doctorNavItems
      : receptionistNavItems

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-soft transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200 dark:border-slate-800">
          <MedicalLogo to="/" subtitle="Smart Healthcare" />
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {/* Active Account Identity Card */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              <span>Verified Account</span>
              <ShieldCheck size={14} className="text-teal-600" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'User'}
                </p>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">
                  Role: {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>

          {/* Strictly Authorized Navigation Links */}
          <div className="space-y-1">
            <div className="px-2 mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {user?.role === 'patient' ? 'Patient Portal Navigation' :
                 user?.role === 'doctor' ? 'Clinical Workspace' :
                 'Reception Operations'}
              </p>
            </div>
            {activeNavItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || (item.href !== '/portal/patient' && location.pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold transition-all text-xs sm:text-sm ${
                    isActive 
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-sm border border-teal-200/60 dark:border-teal-800/60' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive ? 'bg-teal-200/50 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200' : 'text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
          
          {/* Public Views Links */}
          <div className="space-y-1 pt-2">
            <div className="px-2 mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinic & Lounge Display</p>
            </div>
            <Link
              to="/public"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/70 transition-colors text-xs sm:text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <Globe size={18} />
                <span>Public Clinic Site</span>
              </span>
              <ExternalLink size={14} />
            </Link>
            <Link
              to="/public/tv"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm font-medium"
            >
              <Activity size={18} className="text-slate-400" />
              <span>TV Waiting Board</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {user?.role === 'patient' ? 'User / Patient Self-Service Portal' :
                   user?.role === 'receptionist' ? 'Reception Desk & Live Queue Operations' :
                   user?.role === 'doctor' ? 'Doctor Clinical Workspace & EHR' :
                   'Clinic Operations'}
                </h1>
                <span className="badge badge-teal text-[10px] uppercase font-extrabold">
                  {user?.role || 'Guest'}
                </span>
              </div>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Shanti Ayush Health Clinic • Live OPD (Calling Token #{currentServingToken})</span>
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
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
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.name || 'Authorized User'}</p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 uppercase font-bold">{user?.role || 'Role'}</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
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

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
