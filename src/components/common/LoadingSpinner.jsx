import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  }[color];

  const borderTopColorClass = {
    primary: 'border-t-primary-700', // Darker shade for top border
    white: 'border-t-gray-300',
    gray: 'border-t-gray-700',
  }[color];


  return (
    <div className="flex justify-center items-center">
      <div
        className={`inline-block animate-spin rounded-full ${sizeClasses} ${colorClasses} ${borderTopColorClass}`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;