// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/NavbarComponent/Navbar';
import AdminNavbar from './components/AdminComponent/AdminNavbar';
import Dashboard from './pages/Dashboard';
import StudentRegistrationForm from './pages/RegistrationForm';
import StudentList from './pages/StudentList';
import PayFees from './pages/PayFees';
import Passages from './pages/Passages';
import ResetPassword from './pages/ResetPassword';
import LoginComponent from './components/LoginComponent/LoginComponent.jsx';
import LandingPage from './pages/LandingPage';
import { validateAndSyncAuth, validateAndSyncAdminAuth } from './utils/authCheck';
// Admin pages
import Summary from './pages/Summary';
import Tables from './pages/Tables';
import Upload from './pages/Upload';
import Storage from './pages/Storage';
import Update from './pages/Update';
import Approve from './pages/Approve';
import PaidStudents from './pages/PaidStudent';
import AudioPage from './pages/AudioPage';
import NoticeManagement from './pages/NoticeManagement';
import ContactManagement from './pages/ContactManagement';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import ShippingDelivery from './pages/ShippingDelivery'; 

const AdminLayout = ({ handleLogout }) => (
  <>
    <AdminNavbar handleLogout={handleLogout} />
    <Outlet />
  </>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const adminAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
    setIsAuthenticated(auth);
    setIsAdminAuthenticated(adminAuth);
    setIsCheckingAuth(false);
  }, []);

  const handleInstituteLogin = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleAdminLogin = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('instituteName');
    localStorage.removeItem('instituteId');
    setIsAuthenticated(false);
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAdminAuthenticated(true);
  };

  const handleInstituteLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('instituteName');
    localStorage.removeItem('instituteId');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    window.location.href = '/admin/login';
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-delivery" element={<ShippingDelivery />} />

        <Route path="/institute-login" element={
          <LoginComponent 
            setIsAuthenticated={handleInstituteLogin}
            setIsAdminAuthenticated={handleAdminLogin}
            loginType="institute" 
          />
        } />

        <Route path="/admin_login" element={
          <LoginComponent 
            setIsAuthenticated={handleInstituteLogin}
            setIsAdminAuthenticated={handleAdminLogin}
            loginType="admin" 
          />
        } />
        
        <Route path="/admin/login" element={
          <LoginComponent 
            setIsAuthenticated={handleInstituteLogin}
            setIsAdminAuthenticated={handleAdminLogin}
            loginType="admin" 
          />
        } />

        {/* Protected Institute Routes */}
        <Route path="/dashboard" element={
          isAuthenticated ? 
            <Navbar 
              handleLogout={handleInstituteLogout} 
              isAdmin={false} 
            /> : 
            <Navigate to="/" />
        }>
          <Route index element={<Navigate to="overview" />} />
          <Route path="overview" element={<Dashboard />} />
          <Route path="registration" element={<StudentRegistrationForm />} />
          <Route path="students" element={<StudentList />} />
          <Route path="payfees" element={<PayFees />} />
          <Route path="passages" element={<Passages />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          isAdminAuthenticated ? 
            <AdminLayout handleLogout={handleAdminLogout} /> : 
            <Navigate to="/admin/login" />
        }>
          <Route index element={<Navigate to="summary" />} />
          <Route path="summary" element={<Summary />} />
          <Route path="tables">
            <Route index element={<Tables />} />
            <Route path=":tableName" element={<Tables />} />
          </Route>
          <Route path="upload" element={<Upload />} />
          <Route path="storage" element={<Storage />} />
          <Route path="update" element={<Update />} />
          <Route path="approve" element={<Approve />} />
          <Route path="paid-students" element={<PaidStudents />} />
          <Route path="audio" element={<AudioPage />} />
          <Route path="notices" element={<NoticeManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
        </Route>

        <Route path="*" element={
          isAdminAuthenticated ? 
            <Navigate to="/admin/summary" /> : 
            <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
};

export default App;
