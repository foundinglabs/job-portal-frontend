import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';
import { Moon, Sun, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Create a ref for the mobile menu container
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Theme state and logic
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light'
  );

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef, menuButtonRef]);

  return (
    <nav className="bg-white dark:bg-linkedin-dark shadow-md py-4 px-6 md:px-8 flex flex-wrap items-center justify-between rounded-b-xl font-inter sticky top-0 z-50">

      {/* Left Section - Logo and Jobs Button */}
      <div className="flex items-center space-x-6 md:space-x-10 flex-shrink-0">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          FoundingLabs.ai
        </Link>
        <Link
          to="/jobs"
          className={`px-4 py-2 rounded-lg border transition-colors ${
            location.pathname === '/jobs'
              ? 'border-blue-600 text-blue-600 font-semibold shadow-sm dark:border-blue-500 dark:text-blue-500'
              : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100 hover:border-blue-400 hover:text-blue-600'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Jobs
        </Link>
      </div>

      {/* Right Section - Auth and Actions (Hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={handleToggle}
          className="p-2 rounded-full text-gray-600 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors duration-200"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {isAuthenticated ? (
          <>
            <span className="text-gray-700 dark:text-gray-100 text-sm hidden lg:block">
              {user?.email}{' '}
              <span className="text-blue-600 font-medium">({role})</span>
            </span>
            {role === 'candidate' && (
              <Link
                to="/candidate/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            )}
            {role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/post-job"
                  className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg shadow hover:bg-yellow-300 transition font-medium"
                >
                  Post Job
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {/* Mobile Menu Button (Visible on mobile) */}
      <div className="md:hidden" ref={menuButtonRef}>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu (Toggled on mobile) */}
      <div
        className={`md:hidden w-full flex-col mt-4 space-y-4 items-center justify-center transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'flex' : 'hidden'
        }`}
        ref={mobileMenuRef}
      >
        <button
          onClick={handleToggle}
          className="p-2 w-full rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center space-x-2"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>Switch Theme</span>
        </button>
        {isAuthenticated ? (
          <>
            <span className="text-gray-700 dark:text-gray-100 text-sm">
              {user?.email}{' '}
              <span className="text-blue-600 font-medium">({role})</span>
            </span>
            {role === 'candidate' && (
              <Link
                to="/candidate/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            )}
            {role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/post-job"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg shadow hover:bg-yellow-300 transition font-medium"
                >
                  Post Job
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setIsAuthModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-center bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;