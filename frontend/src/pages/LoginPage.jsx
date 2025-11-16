import React from 'react';
import LoginForm from '../components/LoginComponent/LoginComponent';
import logo from '../images/GCC-TBC.png';

function LoginPage({ setIsAuthenticated, setIsAdminAuthenticated, loginType = 'institute' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e4e9f7] font-roboto">
        {/* Login form */}
        <LoginForm 
          setIsAuthenticated={setIsAuthenticated} 
          setIsAdminAuthenticated={setIsAdminAuthenticated}
          loginType={loginType} 
          logo={logo}
        />      
    </div>
  );
}

export default LoginPage;