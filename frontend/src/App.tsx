import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ClinicProvider } from './context/ClinicContext'
import { ToastProvider, ToastContainer } from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import PublicLayout from './layouts/PublicLayout'
import Login from './pages/auth/Login'
import PortalIndex from './pages/portal/PortalIndex'
import RoleGuard from './components/auth/RoleGuard'

// Patient Multi-Page Portal
import PatientLayout from './pages/portal/patient/PatientLayout'
import PatientDoctorsPage from './pages/portal/patient/PatientDoctorsPage'
import PatientQueuePage from './pages/portal/patient/PatientQueuePage'
import PatientHistoryPage from './pages/portal/patient/PatientHistoryPage'
import PatientHelpPage from './pages/portal/patient/PatientHelpPage'

// Receptionist & Doctor Dashboards
import ReceptionistDashboard from './pages/portal/ReceptionistDashboard'
import DoctorDashboard from './pages/portal/DoctorDashboard'
import Patients from './pages/patients/Patients'
import RegisterPatient from './pages/patients/RegisterPatient'
import BookAppointment from './pages/appointments/BookAppointment'

// Public Website
import LandingPage from './pages/public/LandingPage'
import PublicQueue from './pages/public/PublicQueue'
import BookAppointmentPublic from './pages/public/BookAppointmentPublic'
import TvQueueDisplay from './pages/public/TvQueueDisplay'

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
  // Role-Based Portals & Clinic Operations
  {
    path: '/portal',
    element: <MainLayout />,
    children: [
      { index: true, element: <PortalIndex /> },

      // 1. Patient Portal (Multi-page with subroutes, strictly isolated to Patients)
      {
        path: 'patient',
        element: (
          <RoleGuard allowedRoles={['patient']}>
            <PatientLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <PatientDoctorsPage /> },
          { path: 'doctors', element: <PatientDoctorsPage /> },
          { path: 'queue', element: <PatientQueuePage /> },
          { path: 'history', element: <PatientHistoryPage /> },
          { path: 'help', element: <PatientHelpPage /> },
        ],
      },

      // 2. Receptionist Desk (Strictly isolated to Receptionist & Owner)
      {
        path: 'receptionist',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'owner']}>
            <ReceptionistDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'queue',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'owner']}>
            <ReceptionistDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'appointments',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'owner']}>
            <ReceptionistDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'appointments/book',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'owner']}>
            <BookAppointment />
          </RoleGuard>
        ),
      },

      // 3. Doctor Workspace & Clinical EHR (Strictly isolated to Doctor)
      {
        path: 'doctor',
        element: (
          <RoleGuard allowedRoles={['doctor']}>
            <DoctorDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'analytics',
        element: (
          <RoleGuard allowedRoles={['doctor', 'owner']}>
            <DoctorDashboard />
          </RoleGuard>
        ),
      },

      // Common Clinical Directory (Doctor & Receptionist only)
      {
        path: 'patients',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'doctor', 'owner']}>
            <Patients />
          </RoleGuard>
        ),
      },
      {
        path: 'patients/register',
        element: (
          <RoleGuard allowedRoles={['receptionist', 'owner']}>
            <RegisterPatient />
          </RoleGuard>
        ),
      },
    ],
  },
  // Legacy paths alias to portal
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      { index: true, element: <PortalIndex /> },
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
        <ClinicProvider>
          <ToastProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </ToastProvider>
        </ClinicProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
