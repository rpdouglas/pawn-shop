import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

// Self-hosted fonts via @fontsource — no CDN requests at runtime
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/im-fell-english/400.css'
import '@fontsource/im-fell-english/400-italic.css'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/500.css'

import './index.css'
import App from './App.tsx'
import PawnPage from './pages/PawnPage.tsx'
import CannabisPage from './pages/CannabisPage.tsx'
import FireworksPage from './pages/FireworksPage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import SignUpPage from './pages/auth/SignUpPage.tsx'
import MfaEnrollPage from './pages/auth/MfaEnrollPage.tsx'
import IntakePage from './pages/admin/IntakePage.tsx'
import PawnInboxPage from './pages/admin/PawnInboxPage.tsx'
import ReservationsPage from './pages/admin/ReservationsPage.tsx'
import StoreHoursPage from './pages/admin/StoreHoursPage.tsx'
import SerialBlacklistPage from './pages/admin/SerialBlacklistPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import AccessibilityPage from './pages/AccessibilityPage.tsx'
import SellPage from './pages/pawn/SellPage.tsx'
import AgeGate from './components/age-gate/AgeGate.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/pawn" replace /> },
      { path: 'pawn',      element: <PawnPage /> },
      { path: 'pawn/sell', element: <SellPage /> },
      { path: 'cannabis',  element: <AgeGate minAge={19} viewTag="cannabis"><CannabisPage /></AgeGate> },
      { path: 'fireworks', element: <AgeGate minAge={18} viewTag="fireworks"><FireworksPage /></AgeGate> },
      { path: 'login',     element: <LoginPage /> },
      { path: 'signup',    element: <SignUpPage /> },
      { path: 'auth', children: [
        { path: 'mfa-enroll', element: <MfaEnrollPage /> },
      ]},
      { path: 'contact',       element: <ContactPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'admin', children: [
        { path: 'intake',            element: <IntakePage /> },
        { path: 'pawn-inbox',        element: <PawnInboxPage /> },
        { path: 'reservations',      element: <ReservationsPage /> },
        { path: 'store-hours',       element: <StoreHoursPage /> },
        { path: 'serial-blacklist',  element: <SerialBlacklistPage /> },
      ]},
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
