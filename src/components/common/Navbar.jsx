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
    <nav className="bg-white dark:bg-dark-card shadow-md py-4 px-6 flex items-center justify-between rounded-b-xl font-inter">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
          FoundingLabs.ai
        </Link>
        <Link to="/jobs" className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          Jobs
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-gray-700 dark:text-gray-200 text-sm hidden md:block">
              {user?.email} ({role})
            </span>
            {role === 'candidate' && (
              <Link to="/candidate/dashboard" className="btn-primary px-3 py-2">
                Dashboard
              </Link>
            )}
            {role === 'recruiter' && (
              <>
                <Link to="/recruiter/dashboard" className="btn-primary px-3 py-2">
                  Dashboard
                </Link>
                <Link to="/recruiter/post-job" className="btn-primary px-3 py-2 bg-accent-yellow-500 hover:bg-accent-yellow-600">
                  Post Job
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="btn-secondary px-3 py-2"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-primary"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;