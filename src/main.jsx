import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Footer from './Footer.jsx'
// import Mobile from './Mobile.jsx'

createRoot(document.getElementById('Menu')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
createRoot(document.getElementById('Footer')).render(
  <StrictMode>
    <Footer />
  </StrictMode>,
)
