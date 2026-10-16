import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider, ToastContainer } from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Queue from './pages/queue/Queue'
import Appointments from './pages/appointments/Appointments'
import Patients from './pages/patients/Patients'
import DoctorWorkspace from './pages/doctor/DoctorWorkspace'
import Analytics from './pages/analytics/Analytics'
import LandingPage from './pages/public/LandingPage'
import PublicQueue from './pages/public/PublicQueue'
import BookAppointmentPublic from './pages/public/BookAppointmentPublic'
import TvQueueDisplay from './pages/public/TvQueueDisplay'
import RegisterPatient from './pages/patients/RegisterPatient'
import BookAppointment from './pages/appointments/BookAppointment'

const router = createBrowserRouter([
  // Public Clinic Website (Default)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'public', element: <LandingPage /> },
      { path: 'public/queue', element: <PublicQueue /> },
      { path: 'public/book', element: <BookAppointmentPublic /> },
    ],
  },
  // Dedicated TV Fullscreen Display
  {
    path: '/public/tv',
    element: <TvQueueDisplay />,
  },
  // Staff Workspace & Clinic Operations
  {
    path: '/portal',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'queue', element: <Queue /> },
      { path: 'appointments', element: <Appointments /> },
      { path: 'appointments/book', element: <BookAppointment /> },
      { path: 'patients', element: <Patients /> },
      { path: 'patients/register', element: <RegisterPatient /> },
      { path: 'doctor', element: <DoctorWorkspace /> },
      { path: 'analytics', element: <Analytics /> },
    ],
  },
  // Legacy paths alias to portal
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
])

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
