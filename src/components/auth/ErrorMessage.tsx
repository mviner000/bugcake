// src/components/auth/ErrorMessage.tsx

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { parseConvexError } from '@/utils/errorUtils';

/**
 * Renders a stylized error message component with better UX.
 * It's only visible when the 'error' prop is a non-null string.
 */
interface ErrorMessageProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onDismiss,
  className = "" 
}) => {
  if (!error) {
    return null;
  }

  const userFriendlyError = parseConvexError(error);

  return (
    <div className={`relative p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{userFriendlyError}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Alternative: Simple inline error message (for tight spaces)
export const InlineErrorMessage: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  
  const userFriendlyError = parseConvexError(error);
  
  return (
    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {userFriendlyError}
    </p>
  );
};

// Alternative: Toast-style error message
export const ToastErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onDismiss,
  className = "" 
}) => {
  if (!error) return null;
  
  const userFriendlyError = parseConvexError(error);
  
  return (
    <div className={`fixed top-4 right-4 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 ${className}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm font-medium">{userFriendlyError}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};