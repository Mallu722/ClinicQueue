import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { 
  Moon, 
  Sun, 
  Activity, 
  Clock, 
  PhoneCall, 
  Globe, 
  Menu, 
  X, 
  Monitor, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react'

export default function PublicLayout() {
  const { theme, toggleTheme, language, setLanguage, t } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ] as const

  const navLinks = [
    { to: '/public', label: t.navHome },
    { to: '/public/queue', label: t.navQueue },
    { to: '/public/book', label: t.navBook },
    { to: '/public/tv', label: t.navTvDisplay, icon: Monitor },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Notification Strip */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-100 text-xs py-2 px-4 border-b border-teal-700/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-300">{t.badgePilot}</span>
            <span className="hidden md:inline">• {t.clinicTagline}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-teal-200">
              <Clock size={13} className="text-teal-400" />
              <span>OPD: 09:00 AM - 01:30 PM | 05:00 PM - 09:00 PM</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-teal-200">
              <PhoneCall size={13} className="text-teal-400" />
              <span>+91 836 2244 5500</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Glass Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Clinic Branding */}
            <Link to="/public" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {t.clinicName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Live OPD
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ClinicQueue Smart Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.icon && <link.icon size={16} />}
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right Controls: Language Selector, Theme, Staff Portal */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Language Switcher Pill */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <Globe size={14} className="ml-1.5 text-slate-400" />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      language === lang.code
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Staff Portal Link */}
              <Link
                to="/"
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-semibold"
              >
                <ShieldCheck size={15} />
                <span>Staff Portal</span>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">Language / ಭಾಷೆ / भाषा</span>
              <div className="flex items-center gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setMobileMenuOpen(false)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      language === lang.code
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    {link.icon && <link.icon size={18} className="text-teal-600" />}
                    {link.label}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/40"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Staff Workspace & Analytics
                </span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Public Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold">
                  <Activity size={20} />
                </div>
                <span className="text-white font-bold text-lg">{t.clinicName}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.clinicTagline}. Powered by ClinicQueue SaaS for Tier-2 and Tier-3 healthcare providers.
              </p>
              <div className="text-xs text-teal-400 font-medium">
                📍 Vidyanagar, Hubli - 580021, Karnataka
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Actions</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/public/queue" className="hover:text-teal-400 transition-colors">{t.checkTokenBtn}</Link></li>
                <li><Link to="/public/book" className="hover:text-teal-400 transition-colors">{t.bookAppointmentBtn}</Link></li>
                <li><Link to="/public/tv" className="hover:text-teal-400 transition-colors">{t.navTvDisplay}</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition-colors">Doctor & Staff Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">OPD Schedules</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-teal-400">Dr. Ramesh Hegde:</strong> 09:00 AM - 01:30 PM & 05:00 PM - 09:00 PM</li>
                <li><strong className="text-teal-400">Dr. Ananya Rao:</strong> 10:00 AM - 02:00 PM</li>
                <li className="text-slate-400 pt-1">Open: Monday to Saturday</li>
                <li className="text-amber-400 font-medium">Sunday: Emergency OPD Only</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Emergency Contact</h4>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                <p className="text-slate-300">Direct Doctor Desk:</p>
                <p className="text-base font-bold text-teal-400">+91 94800 12345</p>
                <p className="text-slate-400">Ambulance Service: Dial 108</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>{t.footerCopyright}</p>
            <div className="flex items-center gap-4">
              <span className="text-teal-400 font-medium">English • ಕನ್ನಡ • हिंदी</span>
              <span>•</span>
              <span>WhatsApp Integration Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
