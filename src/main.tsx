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

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/pawn" replace /> },
      { path: 'pawn',      element: <PawnPage /> },
      { path: 'cannabis',  element: <CannabisPage /> },
      { path: 'fireworks', element: <FireworksPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
