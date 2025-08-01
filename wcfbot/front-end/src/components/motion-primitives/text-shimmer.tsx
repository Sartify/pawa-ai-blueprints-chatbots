import React from 'react';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const TextShimmer: React.FC<TextShimmerProps> = ({ 
  children, 
  className = '', 
  duration = 2 
}) => {
  return (
    <div className={`animate-pulse ${className}`} style={{ animationDuration: `${duration}s` }}>
      {children}
    </div>
  );
}; 