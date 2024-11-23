import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Booking from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import Blog from './pages/Blog';
import Login from './pages/Admin/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBookings from './pages/Admin/Bookings';
import AdminClients from './pages/Admin/Clients';
import AdminStaff from './pages/Admin/Staff';
import AdminServices from './pages/Admin/Services';
import AdminReviews from './pages/Admin/Reviews';
import AdminBlog from './pages/Admin/Blog';
import AdminStatistics from './pages/Admin/Statistics';
import AdminAISettings from './pages/Admin/AISettings';
import AdminSettings from './pages/Admin/Settings';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/CustomCursor';
import AnimatedBackground from './components/AnimatedBackground';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import { useMediaQuery } from './hooks/useMediaQuery';

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <SEO />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1c1917',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
          <div className="min-h-screen transition-colors duration-300 dark:bg-neutral-950 dark:text-white font-montserrat">
            {!isMobile && <CustomCursor />}
            {!isMobile && <AnimatedBackground />}
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin">
                <Route path="login" element={<Login />} />
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="statistics" element={<AdminStatistics />} />
                  <Route path="ai-settings" element={<AdminAISettings />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/booking" element={
                <>
                  <Navbar />
                  <Booking />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <About />
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/reviews" element={
                <>
                  <Navbar />
                  <Reviews />
                  <Footer />
                </>
              } />
              <Route path="/blog" element={
                <>
                  <Navbar />
                  <Blog />
                  <Footer />
                </>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;