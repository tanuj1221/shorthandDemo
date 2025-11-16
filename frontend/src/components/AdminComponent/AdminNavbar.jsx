import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../images/GCC-TBC.png';

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletDropdownOpen, setIsTabletDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      const response = await fetch('https://www.shorthandexam.in/logoutinsti', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Logout failed');
      }

      // Clear all authentication data
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('instituteId');
      localStorage.removeItem('instituteName');
      
      // Redirect to landing page
      navigate('/');
    } catch (err) {
      console.error('Admin logout error:', err);
      setError(err.message || 'Logout failed');
      
      // Clear all authentication data even on error
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('instituteId');
      localStorage.removeItem('instituteName');
      
      // Redirect to landing page
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleTabletDropdown = () => setIsTabletDropdownOpen(!isTabletDropdownOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeTabletDropdown = () => setIsTabletDropdownOpen(false);

  const isActive = (path) =>
    location.pathname === `/admin${path}` ||
    (path !== '/' && location.pathname.startsWith(`/admin${path}`));

  const primaryNavItems = [
    { name: 'Summary', path: '/summary', icon: '📊' },
    { name: 'Tables', path: '/tables', icon: '📋' },
    { name: 'Upload', path: '/upload', icon: '📤' },
    { name: 'Audio', path: '/audio', icon: '🎧' },
  ];

  const secondaryNavItems = [
    { name: 'Notices', path: '/notices', icon: '📢' },
    { name: 'Contacts', path: '/contacts', icon: '📧' },
    { name: 'Update', path: '/update', icon: '🔄' },
    { name: 'Approve', path: '/approve', icon: '✅' },
    { name: 'Paid Students', path: '/paid-students', icon: '💳' },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-sky-100 shadow-md w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-gray-800 text-xs sm:text-sm font-bold leading-tight truncate">
                  MSCE PUNE COMPUTER SHORTHAND DEMO
                </h1>
                <p className="text-gray-600 text-xs truncate">Welcome Admin</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {allNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={`/admin${item.path}`}
                  className={`px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap
                    ${isActive(item.path) 
                      ? 'text-blue-700 border-b-2 border-blue-700' 
                      : 'text-gray-700 hover:text-blue-700'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogoutClick}
                className="px-2 xl:px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 whitespace-nowrap"
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={`/admin${item.path}`}
                  className={`px-2 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive(item.path) 
                      ? 'text-blue-700 border-b-2 border-blue-700' 
                      : 'text-gray-700 hover:text-blue-700'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="relative">
                <button
                  onClick={toggleTabletDropdown}
                  className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isTabletDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {secondaryNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={`/admin${item.path}`}
                        className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors
                          ${isActive(item.path) 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        onClick={closeTabletDropdown}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          closeTabletDropdown();
                          handleLogoutClick();
                        }}
                        className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <span className="text-base">🚪</span>
                        <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center ml-2 relative">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-sky-200 focus:outline-none transition-colors"
                aria-expanded="false"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {allNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={`/admin${item.path}`}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors
                          ${isActive(item.path) 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        onClick={closeMobileMenu}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          handleLogoutClick();
                        }}
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-base">🚪</span>
                        <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {(isMobileMenuOpen || isTabletDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            closeMobileMenu();
            closeTabletDropdown();
          }}
        />
      )}

      {/* Spacer to offset fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
