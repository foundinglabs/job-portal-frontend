import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 font-inter">
      <div
        className="relative bg-white dark:bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;