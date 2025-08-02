import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto rounded-t-lg shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center text-sm md:space-x-8">
        {/* Privacy Policy Link */}
        {/* Removed mb-4 to ensure consistent centering and spacing */}
        <div>
          <a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200 rounded-md p-2 -m-2">
            Privacy Policy
          </a>
        </div>

        {/* Made with Love Text */}
        {/* Added mt-2 for vertical spacing on smaller screens, removed on medium and larger */}
        <div className="text-center text-gray-400 mt-2 md:mt-0">
          Made with <span className="text-red-500">❤️</span> by foundinglabs.ai
        </div>
      </div>
    </footer>
  );
};

export default Footer;
