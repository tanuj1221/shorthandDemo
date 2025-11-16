import React from 'react';
import LandingNavbar from './LandingComponent/LandingNavbar';
import Footer from './LandingComponent/Footer';

const LegalPageLayout = ({ children, onLoginClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LandingNavbar onLoginClick={onLoginClick} />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;
