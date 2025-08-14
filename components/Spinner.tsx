import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-label="Loading">
      <div 
        className="w-12 h-12 border-4 border-brand-primary border-solid rounded-full animate-spin"
        style={{ borderTopColor: 'transparent' }}
      ></div>
      <p className="text-text-secondary text-lg">Loading...</p>
    </div>
  );
};

export default Spinner;