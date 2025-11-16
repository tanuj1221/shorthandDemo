import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingComponent/LandingNavbar';
import HeroSection from '../components/LandingComponent/HeroSection';
import NoticeBoard from '../components/LandingComponent/NoticeBoard';
import AboutSection from '../components/LandingComponent/AboutSection';
import CoursesSection from '../components/LandingComponent/CoursesSection';
import ContactSection from '../components/LandingComponent/ContactSection';
import Footer from '../components/LandingComponent/Footer';
import LoginOverlay from '../components/LandingComponent/LoginOverlay';

const LandingPage = () => {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setShowLoginOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowLoginOverlay(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
    // Reload the page to trigger auth check in App.jsx
    window.location.href = '/dashboard/overview';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LandingNavbar onLoginClick={handleLoginClick} />
      <HeroSection onLoginClick={handleLoginClick} />
      <NoticeBoard />
      <AboutSection />
      <CoursesSection />
      <ContactSection />
      <Footer />
      
      {showLoginOverlay && (
        <LoginOverlay 
          onClose={handleCloseOverlay}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;
