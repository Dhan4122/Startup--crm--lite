import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LeadProvider } from './context/LeadContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { FilterProvider } from './context/FilterContext.jsx'

/**
 * Application entry point.
 *
 * Provider nesting order (outermost → innermost):
 *   LeadProvider   — owns the lead data store (API-backed via leadService + backend)
 *     ThemeProvider  — owns dark/light mode preference (localStorage-backed, key: 'crm-theme')
 *       FilterProvider — owns persistent filter/search/sort state (localStorage-backed, key: 'startup-crm-filters')
 *         App          — routing, layout, and page components
 *                        (App mounts AuthProvider inside BrowserRouter so useNavigate works)
 *
 * Nesting rationale:
 *  - LeadProvider is outermost so all other providers can consume lead data if needed.
 *  - FilterProvider sits inside LeadProvider so it can safely access LeadContext
 *    for future derived-filter features without restructuring the tree.
 *  - AuthProvider lives inside App → inside BrowserRouter so useNavigate() works.
 *  - App is the innermost consumer — it has access to all contexts.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LeadProvider>
      <ThemeProvider>
        <FilterProvider>
          <App />
        </FilterProvider>
      </ThemeProvider>
    </LeadProvider>
  </StrictMode>,
)
