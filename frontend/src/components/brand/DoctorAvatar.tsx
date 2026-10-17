import { useState } from 'react'

interface DoctorAvatarProps {
  id?: string
  name: string
  specialty?: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBadge?: boolean
  status?: 'AVAILABLE' | 'IN_CONSULTATION' | 'BREAK' | 'OFF_DUTY'
}

export default function DoctorAvatar({
  name,
  specialty = '',
  avatarUrl,
  size = 'md',
  className = '',
  showBadge = true,
  status,
}: DoctorAvatarProps) {
  const [imgError, setImgError] = useState(false)

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }[size]

  // Extract initials
  const cleanName = name.replace(/^Dr\.\s*/i, '').trim()
  const parts = cleanName.split(' ')
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2).toUpperCase()

  // Specialty-based theme gradients and icons
  const theme = (() => {
    const s = specialty.toLowerCase()
    if (s.includes('pediatric') || s.includes('child')) {
      return {
        bg: 'from-amber-500 via-rose-500 to-pink-600',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        ring: 'ring-rose-500/20',
        label: 'Pediatrics',
      }
    }
    if (s.includes('ortho') || s.includes('joint')) {
      return {
        bg: 'from-blue-600 via-indigo-600 to-cyan-600',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        ring: 'ring-blue-500/20',
        label: 'Orthopedics',
      }
    }
    if (s.includes('derma') || s.includes('skin')) {
      return {
        bg: 'from-purple-600 via-fuchsia-600 to-pink-500',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        ring: 'ring-purple-500/20',
        label: 'Dermatology',
      }
    }
    // Default: Physician / Diabetology
    return {
      bg: 'from-teal-600 via-emerald-600 to-cyan-700',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      ring: 'ring-teal-500/20',
      label: 'Physician',
    }
  })()

  // Status dot color
  const statusColor = status === 'AVAILABLE'
    ? 'bg-emerald-500 ring-white dark:ring-slate-900'
    : status === 'IN_CONSULTATION'
    ? 'bg-amber-500 ring-white dark:ring-slate-900'
    : status === 'BREAK'
    ? 'bg-rose-500 ring-white dark:ring-slate-900'
    : 'bg-slate-400 ring-white dark:ring-slate-900'

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses} rounded-2xl object-cover border-2 border-white/80 dark:border-slate-800 shadow-md ring-2 ${theme.ring}`}
        />
      ) : (
        /* 100% Reliable, Crisp Vector Medical Specialist Avatar */
        <div
          className={`${sizeClasses} rounded-2xl bg-gradient-to-tr ${theme.bg} text-white font-black flex flex-col items-center justify-center shadow-md relative overflow-hidden border-2 border-white/90 dark:border-slate-800 ring-2 ${theme.ring}`}
        >
          {/* Subtle medical scrub pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="4" strokeDasharray="6 6" />
            <path d="M50 20 V80 M20 50 H80" stroke="white" strokeWidth="6" strokeLinecap="round" />
          </svg>

          {/* Stethoscope Inlay Icon for small/md, Initials for all */}
          <span className="relative z-10 tracking-tight font-extrabold uppercase">
            {initials}
          </span>
          <span className="relative z-10 text-[8px] font-semibold opacity-90 tracking-widest uppercase">
            MD
          </span>
        </div>
      )}

      {/* Online / Cabin Status Dot */}
      {showBadge && status && (
        <span
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ${statusColor} shadow-sm`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  )
}
