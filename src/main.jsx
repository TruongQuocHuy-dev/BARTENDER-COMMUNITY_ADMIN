import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './pages/App'
import { applyThemeVariables } from './theme'
import './styles/variables.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/components/modal.css'
import './styles/components/upload.css'
import './styles/components/modal-form.css'
import './styles/components/banner-form.css'

applyThemeVariables()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
