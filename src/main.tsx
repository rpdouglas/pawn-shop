import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Self-hosted fonts via @fontsource — no CDN requests at runtime
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/lora/400.css'
import '@fontsource/lora/500.css'
import '@fontsource/lora/600.css'
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
import NotFoundPage from './pages/NotFoundPage.tsx'
import AgeGate from './components/age-gate/AgeGate.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { captureUtm } from './lib/utm.ts'
import AdminLayout from './components/layout/AdminLayout.tsx'

// Capture UTM params from landing URL into sessionStorage on first load
captureUtm()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, lazy: () => import('./pages/HomePage.tsx').then(m => ({ Component: m.default })) },
      { path: 'pawn',      lazy: () => import('./pages/PawnPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'pawn/sell', lazy: () => import('./pages/pawn/SellPage.tsx').then(m => ({ Component: m.default })) },
      {
        path: 'cannabis',
        lazy: async () => {
          const { default: CannabisPage } = await import('./pages/CannabisPage.tsx')
          return { element: <AgeGate minAge={19} viewTag="cannabis"><CannabisPage /></AgeGate> }
        },
      },
      {
        path: 'cannabis/collections/:mood',
        lazy: async () => {
          const { default: MoodCollectionPage } = await import('./pages/cannabis/MoodCollectionPage.tsx')
          return { element: <AgeGate minAge={19} viewTag="cannabis"><MoodCollectionPage /></AgeGate> }
        },
      },
      {
        path: 'fireworks',
        lazy: async () => {
          const { default: FireworksPage } = await import('./pages/FireworksPage.tsx')
          return { element: <AgeGate minAge={18} viewTag="fireworks"><FireworksPage /></AgeGate> }
        },
      },
      {
        path: 'fireworks/collections/bundles',
        lazy: async () => {
          const { default: BundleCollectionPage } = await import('./pages/fireworks/BundleCollectionPage.tsx')
          return { element: <AgeGate minAge={18} viewTag="fireworks"><BundleCollectionPage /></AgeGate> }
        },
      },
      {
        path: 'tobacco',
        lazy: async () => {
          const { default: TobaccoPage } = await import('./pages/TobaccoPage.tsx')
          return { element: <AgeGate minAge={19} viewTag="tobacco"><TobaccoPage /></AgeGate> }
        },
      },
      { path: 'login',      lazy: () => import('./pages/auth/LoginPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'signup',     lazy: () => import('./pages/auth/SignUpPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'favourites', lazy: () => import('./pages/FavouritesPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'auth', children: [
        { path: 'mfa-enroll', lazy: () => import('./pages/auth/MfaEnrollPage.tsx').then(m => ({ Component: m.default })) },
      ]},
      { path: 'contact',       lazy: () => import('./pages/ContactPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'accessibility', lazy: () => import('./pages/AccessibilityPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'privacy',       lazy: () => import('./pages/PrivacyPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'terms',         lazy: () => import('./pages/TermsPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'item/:id',      lazy: () => import('./pages/ItemDetailPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'staff', children: [
        { path: 'schedule', lazy: () => import('./pages/staff/SchedulePage.tsx').then(m => ({ Component: m.default })) },
      ]},
      { path: 'articles/:slug', lazy: () => import('./pages/ArticleDetailPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'faq',            lazy: () => import('./pages/FaqPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'local/:location', lazy: () => import('./pages/LocalSeoPage.tsx').then(m => ({ Component: m.default })) },
      { path: 'admin', element: <AdminLayout />, children: [
        { path: 'intake',            lazy: () => import('./pages/admin/IntakePage.tsx').then(m => ({ Component: m.default })) },
        { path: 'inventory',         lazy: () => import('./pages/admin/InventoryPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'pawn-inbox',        lazy: () => import('./pages/admin/PawnInboxPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'reservations',      lazy: () => import('./pages/admin/ReservationsPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'store-hours',       lazy: () => import('./pages/admin/StoreHoursPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'serial-blacklist',  lazy: () => import('./pages/admin/SerialBlacklistPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'staff-picks',       lazy: () => import('./pages/admin/StaffPicksPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'staff',             lazy: () => import('./pages/admin/StaffManagementPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'scheduling',        lazy: () => import('./pages/admin/SchedulingPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'dashboard',         lazy: () => import('./pages/admin/DashboardPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'crm',               lazy: () => import('./pages/admin/crm/CrmDashboardPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'crm/:uid',          lazy: () => import('./pages/admin/crm/CustomerDetailPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'preorders',         lazy: () => import('./pages/admin/PreorderInboxPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'campaigns',         lazy: () => import('./pages/admin/CampaignAdminPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'disputes',          lazy: () => import('./pages/admin/DisputeAdminPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'articles',          lazy: () => import('./pages/admin/ArticleListPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'articles/:id/edit', lazy: () => import('./pages/admin/ArticleEditorPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'faqs',              lazy: () => import('./pages/admin/FaqAdminPage.tsx').then(m => ({ Component: m.default })) },
        { path: 'mobile-intake',     lazy: () => import('./pages/admin/MobileIntakePage.tsx').then(m => ({ Component: m.default })) },
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
