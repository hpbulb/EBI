import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import logoUrl from '../logo/ChatGPT Image Jun 9, 2026, 04_03_29 AM.png'
import App from './App.jsx'

document.querySelector('link[rel="icon"]')?.setAttribute('href', logoUrl)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
