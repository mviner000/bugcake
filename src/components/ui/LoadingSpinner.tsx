// src/components/ui/LoadingSpinner.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'white' | 'gray' | 'orange' | 'current';
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

const colorClasses = {
  white: 'text-white',
  gray: 'text-gray-500',
  orange: 'text-orange-500',
  current: 'text-current'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '',
  color = 'current'
}) => {
  return (
    <div
      className={cn(
        'animate-spin inline-block border-2 border-solid border-current border-r-transparent rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Alternative dot-based spinner
export const LoadingDots: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '',
  color = 'current'
}) => {
  const dotSize = size === 'xs' ? 'w-1 h-1' : 
                 size === 'sm' ? 'w-1.5 h-1.5' :
                 size === 'md' ? 'w-2 h-2' :
                 size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className={cn('flex items-center space-x-1', className)} role="status" aria-label="Loading">
      <div className={cn(dotSize, 'bg-current rounded-full animate-pulse', colorClasses[color])} style={{ animationDelay: '0ms' }} />
      <div className={cn(dotSize, 'bg-current rounded-full animate-pulse', colorClasses[color])} style={{ animationDelay: '150ms' }} />
      <div className={cn(dotSize, 'bg-current rounded-full animate-pulse', colorClasses[color])} style={{ animationDelay: '300ms' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Pulse-based loading indicator
export const LoadingPulse: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '',
  color = 'current'
}) => {
  return (
    <div
      className={cn(
        'rounded-full bg-current animate-pulse',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};