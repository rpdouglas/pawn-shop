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
import InventoryPage from './pages/admin/InventoryPage.tsx'
import PawnInboxPage from './pages/admin/PawnInboxPage.tsx'
import ReservationsPage from './pages/admin/ReservationsPage.tsx'
import StoreHoursPage from './pages/admin/StoreHoursPage.tsx'
import SerialBlacklistPage from './pages/admin/SerialBlacklistPage.tsx'
import StaffPicksPage from './pages/admin/StaffPicksPage.tsx'
import StaffManagementPage from './pages/admin/StaffManagementPage.tsx'
import SchedulingPage from './pages/admin/SchedulingPage.tsx'
import PreorderInboxPage from './pages/admin/PreorderInboxPage.tsx'
import CampaignAdminPage from './pages/admin/CampaignAdminPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import AccessibilityPage from './pages/AccessibilityPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import SellPage from './pages/pawn/SellPage.tsx'
import MoodCollectionPage from './pages/cannabis/MoodCollectionPage.tsx'
import BundleCollectionPage from './pages/fireworks/BundleCollectionPage.tsx'
import SchedulePage from './pages/staff/SchedulePage.tsx'
import AgeGate from './components/age-gate/AgeGate.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import DashboardPage from './pages/admin/DashboardPage.tsx'
import { captureUtm } from './lib/utm.ts'

// Capture UTM params from landing URL into sessionStorage on first load
captureUtm()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/pawn" replace /> },
      { path: 'pawn',      element: <PawnPage /> },
      { path: 'pawn/sell', element: <SellPage /> },
      { path: 'cannabis',  element: <AgeGate minAge={19} viewTag="cannabis"><CannabisPage /></AgeGate> },
      { path: 'cannabis/collections/:mood', element: <AgeGate minAge={19} viewTag="cannabis"><MoodCollectionPage /></AgeGate> },
      { path: 'fireworks', element: <AgeGate minAge={18} viewTag="fireworks"><FireworksPage /></AgeGate> },
      { path: 'fireworks/collections/bundles', element: <AgeGate minAge={18} viewTag="fireworks"><BundleCollectionPage /></AgeGate> },
      { path: 'login',     element: <LoginPage /> },
      { path: 'signup',    element: <SignUpPage /> },
      { path: 'auth', children: [
        { path: 'mfa-enroll', element: <MfaEnrollPage /> },
      ]},
      { path: 'contact',       element: <ContactPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'staff', children: [
        { path: 'schedule', element: <SchedulePage /> },
      ]},
      { path: 'admin', children: [
        { path: 'intake',            element: <IntakePage /> },
        { path: 'inventory',         element: <InventoryPage /> },
        { path: 'pawn-inbox',        element: <PawnInboxPage /> },
        { path: 'reservations',      element: <ReservationsPage /> },
        { path: 'store-hours',       element: <StoreHoursPage /> },
        { path: 'serial-blacklist',  element: <SerialBlacklistPage /> },
        { path: 'staff-picks',       element: <StaffPicksPage /> },
        { path: 'staff',             element: <StaffManagementPage /> },
        { path: 'scheduling',        element: <SchedulingPage /> },
        { path: 'dashboard',         element: <DashboardPage /> },
        { path: 'preorders',         element: <PreorderInboxPage /> },
        { path: 'campaigns',         element: <CampaignAdminPage /> },
      ]},
      { path: '*', element: <NotFoundPage /> },
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
