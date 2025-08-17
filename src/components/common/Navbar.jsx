import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    // AuthContext's onAuthStateChange listener will handle redirection to '/'
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md shadow-md py-3 px-6 flex items-center justify-between rounded-b-xl font-inter transition-all">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold text-primary-600 dark:text-primary-400 transition-transform"
        >
          FoundingLabs.ai
        </Link>
        <Link
          to="/jobs"
          className="px-3 py-2 text-sm md:text-base rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          Jobs
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="hidden md:block text-gray-700 dark:text-gray-200 text-sm italic">
              {user?.email} <span className="font-medium">({role})</span>
            </span>

            {role === 'candidate' && (
              <Link
                to="/candidate/dashboard"
                className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-md transition-all"
              >
                Dashboard
              </Link>
            )}

            {role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/post-job"
                  className="px-4 py-2 rounded-md bg-accent-yellow-500 hover:bg-accent-yellow-600 text-gray-900 text-sm font-semibold shadow-md transition-all"
                >
                  Post Job
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm md:text-base font-semibold shadow-md transition-all"
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
