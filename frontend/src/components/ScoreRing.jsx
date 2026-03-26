import React from 'react';

export default function ScoreRing({ score, max = 100, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = "text-error";
  if (percentage >= 75) colorClass = "text-success";
  else if (percentage >= 50) colorClass = "text-warning";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      {/* Score text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black">{score}</span>
        <span className="text-xs text-text-muted">/ {max}</span>
      </div>
    </div>
  );
}
