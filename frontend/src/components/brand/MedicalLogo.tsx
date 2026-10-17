import { Link } from 'react-router-dom'

interface MedicalLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  subtitle?: string
  className?: string
  to?: string
}

export default function MedicalLogo({
  size = 'md',
  showText = true,
  subtitle = 'Smart Healthcare & OPD',
  className = '',
  to = '/', // Clicking logo takes user to Home page as requested
}: MedicalLogoProps) {
  const sizeClasses = {
    sm: { box: 'w-9 h-9', iconSize: 20, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', iconSize: 24, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', iconSize: 32, text: 'text-2xl', sub: 'text-xs' },
  }[size]

  const content = (
    <div className={`flex items-center gap-3 group select-none cursor-pointer ${className}`}>
      {/* Premium Medical Shield Cross Emblem */}
      <div
        className={`${sizeClasses.box} rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300 relative shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Symmetrical Medical Cross */}
          <rect x="15" y="7" width="6" height="22" rx="2.5" fill="#FFFFFF" fillOpacity="0.95" />
          <rect x="7" y="15" width="22" height="6" rx="2.5" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Golden/Emerald Pulse Line */}
          <path
            d="M8 18 L13 18 L15.5 11 L19 25 L21.5 16 L23.5 19 L28 18"
            stroke="#042F2E"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live heartbeat pulse dot */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
        </span>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`${sizeClasses.text} font-black tracking-tight bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-600 dark:from-teal-300 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent leading-none`}
            >
              ClinicQueue
            </span>
            <span className="px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[9px] font-extrabold uppercase tracking-wider">
              Health
            </span>
          </div>
          <span
            className={`${sizeClasses.sub} text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5`}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} title="Go to ClinicQueue Home Page">
        {content}
      </Link>
    )
  }

  return content
}
