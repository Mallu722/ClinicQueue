import { createContext, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])
    
    const duration = toast.duration ?? 3000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const value = {
    toasts,
    addToast,
    removeToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success/95 text-white border-success'
      case 'error':
        return 'bg-error/95 text-white border-error'
      case 'warning':
        return 'bg-warning/95 text-white border-warning'
      default:
        return 'bg-primary-600 text-white border-primary-600'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 ease-out transform translate-y-0 opacity-100 ${getToastStyles(toast.type)}`}
          role="alert"
        >
          {toast.title && (
            <div className="flex-1">
              <h3 className="font-medium text-sm">{toast.title}</h3>
              {toast.message && <p className="text-xs mt-1 opacity-90">{toast.message}</p>}
            </div>
          )}
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close toast"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
