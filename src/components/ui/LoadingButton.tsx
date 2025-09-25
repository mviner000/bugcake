// src/components/ui/LoadingButton.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spinnerColor?: 'white' | 'gray' | 'orange' | 'current';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  spinnerSize = 'sm',
  spinnerColor = 'current',
  ...props
}) => {
  const isDisabled = loading || disabled;

  return (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(
        'relative',
        isDisabled && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size={spinnerSize} color={spinnerColor} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};