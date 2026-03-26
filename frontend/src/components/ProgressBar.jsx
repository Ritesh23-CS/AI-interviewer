import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full bg-bg-main rounded-full h-2.5 mb-4 overflow-hidden border border-gray-800">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
