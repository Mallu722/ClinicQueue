import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Queue from './pages/queue/Queue'
import Appointments from './pages/appointments/Appointments'
import Patients from './pages/patients/Patients'
import DoctorWorkspace from './pages/doctor/DoctorWorkspace'
import Analytics from './pages/analytics/Analytics'
import PublicQueue from './pages/public/PublicQueue'
import RegisterPatient from './pages/patients/RegisterPatient'
import BookAppointment from './pages/appointments/BookAppointment'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'queue', element: <Queue /> },
      { path: 'appointments', element: <Appointments /> },
      { path: 'patients', element: <Patients /> },
      { path: 'patients/register', element: <RegisterPatient /> },
      { path: 'appointments/book', element: <BookAppointment /> },
      { path: 'doctor', element: <DoctorWorkspace /> },
      { path: 'analytics', element: <Analytics /> },
    ],
  },
  {
    path: '/public',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicQueue /> },
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
