import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from '../../images/GCC-TBC.png';

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [instituteDetails, setInstituteDetails] = useState({
    instituteId: '',
    instituteName: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://www.shorthandexam.in/institutedetails', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch institute details');
        }

        const data = await response.json();
        setInstituteDetails({
          instituteId: data.instituteId,
          instituteName: data.InstituteName
        });

        // Store in localStorage for persistence
        localStorage.setItem('instituteId', data.instituteId);
        localStorage.setItem('instituteName', data.InstituteName);
      } catch (err) {
        console.error('Error fetching institute details:', err);
        setError('Failed to load institute details');
        // Fallback to localStorage if available
        const storedId = localStorage.getItem('instituteId');
        const storedName = localStorage.getItem('instituteName');
        if (storedId && storedName) {
          setInstituteDetails({
            instituteId: storedId,
            instituteName: storedName
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstituteDetails();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    setIsLoggingOut(true);
    setError(null);

    try {
      const response = await fetch('https://www.shorthandexam.in/logoutinsti', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instituteId: instituteDetails.instituteId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Logout failed');
      }

      // Clear all authentication data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('instituteName');
      localStorage.removeItem('instituteId');
      
      // Redirect to landing page
      navigate('/');
    } catch (err) {
      setError(err.message || 'Logout failed');
      console.error('Logout error:', err);
      
      // Clear all authentication data even on error
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('instituteName');
      localStorage.removeItem('instituteId');
      
      // Redirect to landing page
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Fixed Navbar - Modern Design */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg px-3 sm:px-4 lg:px-6 py-3 z-50 border-b border-indigo-100">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and Institute Name - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <img 
              src={logo} 
              alt="logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" 
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-xs sm:text-sm lg:text-base leading-tight truncate">
                Shorthand LMS
              </span>
              {isLoading ? (
                <div className="animate-pulse h-4 w-40 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-xs text-gray-600 truncate">
                  {instituteDetails.instituteId} - {instituteDetails.instituteName}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation - Modern Design */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link 
              to="/dashboard/overview" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link 
              to="/dashboard/registration" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Registration
            </Link>
            <Link 
              to="/dashboard/students" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Students
            </Link>
            <Link 
              to="/dashboard/payfees" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Pay Fees
            </Link>
            <a
              href="https://shorthandbucket.s3.ap-south-1.amazonaws.com/publish/publish.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Download
            </a>
            <Link 
              to="/dashboard/passages" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Passages
            </Link>
            <Link 
              to="/dashboard/reset-password" 
              className="px-2 xl:px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
            >
              Reset Password
            </Link>
          </div>

          {/* Tablet Navigation - Simplified */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <Link 
              to="/dashboard/overview" 
              className="px-2 py-2 text-sm hover:text-green-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/dashboard/registration" 
              className="px-2 py-2 text-sm hover:text-green-700 transition-colors"
            >
              Register
            </Link>
            <Link 
              to="/dashboard/students" 
              className="px-2 py-2 text-sm hover:text-green-700 transition-colors"
            >
              Students
            </Link>
            <div className="relative">
              <button
                onClick={toggleMobileMenu}
                className="px-2 py-2 text-sm hover:text-green-700 transition-colors flex items-center"
              >
                More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tablet Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link 
                    to="/dashboard/payfees" 
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Pay Fees
                  </Link>
                  <a
                    href="https://shorthandbucket.s3.ap-south-1.amazonaws.com/publish/publish.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Download Demo
                  </a>
                  <Link 
                    to="/dashboard/passages" 
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Passages
                  </Link>
                  <Link 
                    to="/dashboard/reset-password" 
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-t border-gray-200"
                    onClick={closeMobileMenu}
                  >
                    Reset Password
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Log Out Button */}
          <div className="hidden md:block ml-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut || isLoading}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </button>
            {error && <div className="text-red-500 text-xs mt-1 absolute right-4">{error}</div>}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center ml-2 relative">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-800 focus:outline-none p-2 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <Link 
                    to="/dashboard/overview" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    📊 Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/registration" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    📝 Registration Form
                  </Link>
                  <Link 
                    to="/dashboard/students" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    👥 Students List
                  </Link>
                  <Link 
                    to="/dashboard/payfees" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    💳 Pay Fees
                  </Link>
                  <a
                    href="https://shorthandbucket.s3.ap-south-1.amazonaws.com/publish/publish.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    ⬇️ Download Demo
                  </a>
                  <Link 
                    to="/dashboard/passages" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    📖 Passages
                  </Link>
                  <Link 
                    to="/dashboard/reset-password" 
                    className="block px-4 py-3 text-sm hover:bg-gray-100 transition-colors border-t border-gray-200"
                    onClick={closeMobileMenu}
                  >
                    🔑 Reset Password
                  </Link>
                  <button
                    onClick={(e) => {
                      closeMobileMenu();
                      handleLogout(e);
                    }}
                    disabled={isLoggingOut || isLoading}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 disabled:opacity-50"
                  >
                    🚪 {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </button>
                  {error && (
                    <div className="text-red-500 text-xs px-4 py-2 bg-red-50 border-t border-gray-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Click outside to close mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Main Content with responsive padding */}
      <div className="flex-grow pt-14 sm:pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Navbar;