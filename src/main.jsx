// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DriverLogin from './pages/DriverLogin.jsx'
import DriverDashboard from './pages/DriverDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import PortalooManager from './pages/PortalooManager.jsx'
import BookingsDashboard from './pages/BookingsDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/driver" element={<DriverLogin />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/portaloos" element={<PortalooManager />} />
        <Route path="/admin/bookings" element={<BookingsDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
