import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white dark:bg-dark-card shadow-md py-4 px-6 flex items-center justify-between rounded-b-xl font-inter sticky top-0 z-50">
      
      {/* Left Section */}
      <div className="flex items-center space-x-10">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-blue-600"
        >
          FoundingLabs.ai
        </Link>

        {/* Jobs Button */}
        <Link
          to="/jobs"
          className={`px-4 py-2 rounded-lg border transition-colors ${
            location.pathname === '/jobs'
              ? 'border-blue-600 text-blue-600 font-semibold shadow-sm'
              : 'border-gray-300 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          Jobs
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-gray-700 dark:text-gray-200 text-sm hidden md:block">
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
              className="border border-gray-300 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
