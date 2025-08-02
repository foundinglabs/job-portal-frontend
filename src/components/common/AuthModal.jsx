import React, { useState } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, loginWithSocial, signupCandidate, signupRecruiter, loading: authContextLoading } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isRecruiterPath, setIsRecruiterPath] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCompanyName('');
    setCompanyWebsite('');
    setCompanyDescription('');
    setCompanyLogoUrl('');
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(handleClose, 1000); // Close modal after short delay
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (isRecruiterPath) {
          await signupRecruiter(email, password, {
            name: companyName,
            website: companyWebsite,
            description: companyDescription,
            logo_url: companyLogoUrl,
          });
          setSuccessMessage('Recruiter account created! Please check your email for confirmation (if enabled). Redirecting...');
          setTimeout(handleClose, 2000);
        } else {
          await signupCandidate(email, password);
          setSuccessMessage('Candidate account created! Please check your email for confirmation (if enabled). Redirecting...');
          setTimeout(handleClose, 2000);
        }
      }
    } catch (err) {
      console.error('Auth operation failed:', err);
      setError(err.message || 'An unexpected error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithSocial(provider);
    } catch (err) {
      console.error(`Social login (${provider}) error:`, err);
      setError(err.message || `Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isLoginMode ? 'Login' : 'Sign Up'}>
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              isLoginMode ? 'bg-primary-600 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              !isLoginMode ? 'bg-primary-600 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* This is the new scrollable container */}
      <div className="max-h-[70vh] overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
        {!isLoginMode && (
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setIsRecruiterPath(false)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  !isRecruiterPath ? 'bg-primary-500 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                As Candidate
              </button>
              <button
                onClick={() => setIsRecruiterPath(true)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  isRecruiterPath ? 'bg-primary-500 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                As Recruiter
              </button>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-sm mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          {!isLoginMode && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          )}
          {!isLoginMode && isRecruiterPath && (
            <>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Company Details</h3>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Website *</label>
                  <input
                    type="url"
                    id="companyWebsite"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    required
                    placeholder="https://www.example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description (Optional)</label>
                  <textarea
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows="3"
                    className="input-field"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="companyLogoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Logo URL (Optional)</label>
                  <input
                    type="url"
                    id="companyLogoUrl"
                    value={companyLogoUrl}
                    onChange={(e) => setCompanyLogoUrl(e.target.value)}
                    placeholder="https://www.example.com/logo.png"
                    className="input-field"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || authContextLoading}
          >
            {(loading || authContextLoading) ? <LoadingSpinner size="sm" color="white" /> : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2 my-6">
          <span className="h-px w-1/4 bg-gray-300 dark:bg-gray-600"></span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <span className="h-px w-1/4 bg-gray-300 dark:bg-gray-600"></span>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="btn-secondary w-full flex items-center justify-center"
            disabled={loading || authContextLoading}
          >
            <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google logo" className="mr-2" />
            {isLoginMode ? 'Continue with Google' : 'Sign Up with Google'}
          </button>
          <button
            onClick={() => handleSocialLogin('linkedin')}
            className="btn-secondary w-full flex items-center justify-center bg-[#0A66C2] text-white hover:bg-[#004182] dark:bg-[#0A66C2] dark:hover:bg-[#004182]"
            disabled={loading || authContextLoading}
          >
            <img src="https://img.icons8.com/color/24/000000/linkedin.png" alt="LinkedIn logo" className="mr-2" />
            {isLoginMode ? 'Continue with LinkedIn' : 'Sign Up with LinkedIn'}
          </button>
        </div>
      </div> {/* End of scrollable container */}
    </Modal>
  );
};

export default AuthModal;
