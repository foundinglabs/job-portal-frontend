import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-linkedin-dark text-gray-400 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Section 1: Founding Labs */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4">Founding Labs</h3>
          <p className="text-sm">
            Connecting top talent with their dream jobs and helping companies build their perfect team.
          </p>
          <div className="flex space-x-4 mt-4 text-gray-400">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="w-6 h-6 hover:text-white transition-colors" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="w-6 h-6 hover:text-white transition-colors" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter className="w-6 h-6 hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            </li>
          </ul>
        </div>

        {/* Section 3: with foundinglabs */}
        <div className="lg:col-span-2">
          <div className="flex items-center text-white mb-4">
            <div className="text-center text-gray-400 mt-2 md:mt-0">
              Made with <span className="text-red-500">❤️</span> by FoundingLabs.ai
            </div>
          </div>
          <p className="text-sm">
            Built with passion and dedication to help you succeed in your career journey.
          </p>
        </div>
      </div>

      <hr className="my-8 border-gray-700 dark:border-gray-600" />

      {/* Footer Bottom */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
        <p className="text-center sm:text-left mb-2 sm:mb-0">
          © 2025 Founding Labs. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;