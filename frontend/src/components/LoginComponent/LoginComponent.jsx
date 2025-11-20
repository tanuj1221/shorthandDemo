
//frontend\src\components\LoginComponent\LoginComponent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../images/GCC-TBC.png';

function LoginComponent({ setIsAuthenticated, setIsAdminAuthenticated, loginType = 'institute' }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const apiUrl = loginType === 'admin'
        ? 'http://localhost:3001/admin_login'
        : 'http://localhost:3001/login_institute';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, password }),
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(typeof data === 'object' ? data.message || 'Login failed' : data || 'Login failed');
      }

      // Handle successful login
      if (loginType === 'admin') {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('instituteId');
        localStorage.removeItem('instituteName');

        setIsAdminAuthenticated();
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/summary');
      } else {
        localStorage.removeItem('isAdminAuthenticated');

        setIsAuthenticated();
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('instituteId', data.instituteId || userId);
        localStorage.setItem('instituteName', data.instituteName || 'Institute');
        navigate('/dashboard/overview');
      }

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => loginType === 'admin' ? 'Username' : 'Institute ID';

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e4e9f7] font-roboto relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-200 rounded-full opacity-35 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      <div className="absolute bottom-40 right-16 w-14 h-14 bg-pink-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>

      <div className="relative w-[600px] h-[620px] bg-white rounded-2xl overflow-hidden shadow-md">
        {/* Spinning background animation */}
        <div className="absolute w-[4000px] h-[620px] top-[-50%] left-[-50%] bg-gradient-to-b from-transparent via-[#ebebeb] to-[#ebebeb] z-[1] origin-bottom-right animate-spin [animation-duration:6s]" />
        <div className="absolute w-[400px] h-[470px] top-[-50%] left-[-50%] bg-gradient-to-b from-transparent via-[#d3d3d3] to-[#d3d3d3] z-[1] origin-bottom-right animate-spin [animation-duration:6s] [animation-delay:-3s]" />
        <div className="absolute inset-0">
          <div className="absolute w-[400px] h-[470px] top-[-50%] left-[-50%] bg-gradient-to-b from-transparent via-[#c0c0c0] to-[#c0c0c0] z-[1] origin-bottom-right animate-spin [animation-duration:6s]" />
        </div>

        <form onSubmit={handleLogin} className="absolute inset-[4px] bg-[#f8f8f8] rounded-2xl z-[2] flex flex-col items-center justify-center px-10 py-12">
          <img className="w-[200px] h-auto mb-8 transform transition-transform duration-300 hover:scale-105" src={logo} alt="GCC-TBC Logo" />
          <h2 className="text-[#23242a] font-medium text-center tracking-[0.1em] text-2xl mb-8">
            {loginType === 'admin' ? 'Admin Sign In' : 'Sign In'}
          </h2>

          {/* Username/Institute ID Field */}
          <div className="relative w-[300px] mt-9 group">
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="relative w-full pt-5 pb-2 px-2 bg-transparent outline-none border-none text-[#23242a] text-base tracking-[0.05em] z-10 peer transition-all duration-300"
            />
            <span className="absolute left-0 pt-5 pb-2 px-0 text-[#8f8f8f] text-base transition-all duration-500 pointer-events-none
              peer-valid:text-sm peer-focus:text-sm peer-valid:-translate-y-8 peer-focus:-translate-y-8
              peer-valid:text-black peer-focus:text-black hover:text-black
            ">
              {getPlaceholderText()}
            </span>
            <i className="absolute left-0 bottom-0 w-full h-px bg-[#8f8f8f] transition-all duration-500
              peer-valid:h-0.5 peer-focus:h-0.5 peer-valid:bg-black peer-focus:bg-black
            " />
          </div>

          {/* Password Field */}
          <div className="relative w-[300px] mt-9 group">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative w-full pt-5 pb-2 px-2 pr-10 bg-transparent outline-none border-none text-[#23242a] text-base tracking-[0.05em] z-10 peer transition-all duration-300"
            />
            <span className="absolute left-0 pt-5 pb-2 px-0 text-[#8f8f8f] text-base transition-all duration-500 pointer-events-none peer-valid:text-sm peer-focus:text-sm peer-valid:-translate-y-8 peer-focus:-translate-y-8 peer-valid:text-black peer-focus:text-black hover:text-black">
              Password
            </span>
            <i className="absolute left-0 bottom-0 w-full h-px bg-[#8f8f8f] transition-all duration-500 peer-valid:h-0.5 peer-focus:h-0.5 peer-valid:bg-black peer-focus:bg-black" />

            <div className="absolute right-2 top-5 z-20 cursor-pointer">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-[#8f8f8f] hover:text-black transition-all duration-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`border-none outline-none py-2 px-6 bg-[#23242a] text-white cursor-pointer text-sm rounded font-semibold w-[100px] mt-8 transition-all duration-600 hover:bg-[#31e1f7] hover:text-[#23242a] active:opacity-80 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500 opacity-75 hover:opacity-100 transition-opacity duration-300">
        © {new Date().getFullYear()} GCC-TBC. All rights reserved.
      </div>
    </div>
  );
}

export default LoginComponent;

