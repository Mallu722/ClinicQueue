import { Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function PublicLayout() {
  const { theme, toggleTheme, language, setLanguage } = useTheme()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-main to-primary-50/30">
      <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-background-border">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'kn')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${language === lang.code ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-background-card'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white shadow-sm border border-background-border text-text-secondary hover:text-primary-600 transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="relative z-10">
        <Outlet />
      </div>

      <footer className="absolute bottom-0 w-full py-6 text-center text-text-secondary/60 text-sm">
        © 2026 ClinicQueue. Built for small clinics in Tier-2 and Tier-3 India.
      </footer>
    </div>
  )
}
