import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import './styles/navbar.css'
import './styles/tonightspick.css'
import './styles/carousel.css'
import './styles/genre.css'
import './styles/modal.css'
import './styles/upcoming.css'
import './styles/auth.css'
import './styles/submit.css'
import './styles/readinglist.css'
import './styles/continue-reading.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)