import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateAndSyncAuth } from '../../utils/authCheck';

const HeroSection = ({ onLoginClick }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate authentication with backend session
    const checkAuth = async () => {
      const isValid = await validateAndSyncAuth();
      if (import.meta.env.DEV) {
        console.log('[HeroSection] Session validation result:', isValid);
      }
      setIsAuthenticated(isValid);
    };
    checkAuth();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-2xl transform rotate-12 hover:rotate-45 transition-transform duration-500"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float animation-delay-2000">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-2xl"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-4000">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-2xl transform -rotate-12"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-block">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                🎓 Welcome to the Future of Learning
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Master
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Shorthand
              </span>
              with Excellence
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Transform your shorthand skills with our smart learning management system.
              Personalized courses, real-time feedback, and expert guidance all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard/overview')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <LayoutDashboard className="w-6 h-6" />
                  <span>Go to Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Get Started
                </button>
              )}
              <button
                onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Courses
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-indigo-600">580+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-indigo-600">16</div>
                <div className="text-sm text-gray-600">Speed Levels</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-indigo-600">3</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </div>

          {/* Right 3D Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[600px]">
              {/* Main Card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96 transform-gpu perspective-1000">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl transform rotate-6 animate-float"></div>
                  <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-8 transform -rotate-3 animate-float animation-delay-1000">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
