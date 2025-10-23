import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './styles.css'

// Automatic theme (follows system) + manual override with persistence
const THEME_KEY = 'ic-theme'
function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY) // 'light' | 'dark' | null
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved)
    return
  }
  // automatic by system
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark')
}
applyTheme()

// Listen for system changes when in automatic mode (no manual override saved)
function watchSystemTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) return // manual mode
  const mq = window.matchMedia('(prefers-color-scheme: light)')
  const onChange = () => applyTheme()
  mq.addEventListener('change', onChange)
  window.addEventListener('storage', applyTheme)
}
watchSystemTheme()

export function setManualTheme(mode: 'auto' | 'light' | 'dark') {
  if (mode === 'auto') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.dataset.theme = mql.matches ? 'dark' : 'light'
  } else {
    document.documentElement.dataset.theme = mode
  }
}
setManualTheme('auto')


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
