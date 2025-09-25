// src/utils/errorUtils.ts

/**
 * Maps technical error messages to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Authentication errors
  'InvalidAccountId': 'Not found in database',
  'InvalidSecret': 'Invalid email or password. Please check your credentials and try again.',
  'Invalid credentials': 'Invalid email or password. Please check your credentials and try again.',
  'User not found': 'No account found with this email address.',
  'Email already exists': 'An account with this email already exists. Try signing in instead.',
  'Weak password': 'Password must be at least 8 characters long.',
  'Invalid email': 'Please enter a valid email address.',
  
  // Convex specific errors
  'Server Error': 'Something went wrong on our end. Please try again.',
  'Network error': 'Connection problem. Please check your internet and try again.',
  'Timeout': 'Request timed out. Please try again.',
  
  // Rate limiting
  'Too many requests': 'Too many attempts. Please wait a moment before trying again.',
  'Rate limited': 'Too many attempts. Please wait a moment before trying again.',
  
  // Verification errors
  'Email not verified': 'Please verify your email address before signing in.',
  'Account not approved': 'Your account is pending approval. Please contact support if you need assistance.',
  'Account declined': 'Your account access has been declined. Please contact support for more information.',
  
  // Generic fallbacks
  'Unknown error': 'An unexpected error occurred. Please try again.',
};

/**
 * Extracts and cleans error messages from Convex error responses
 * 
 * @param error - Raw error message from Convex
 * @returns User-friendly error message
 */
export function parseConvexError(error: string): string {
  if (!error || typeof error !== 'string') {
    return ERROR_MESSAGE_MAP['Unknown error'];
  }

  // Remove Convex-specific prefixes like "[CONVEX A(auth:signIn)] [Request ID: ...] Server Error"
  let cleanedError = error
    .replace(/\[CONVEX [^\]]+\]/g, '') // Remove [CONVEX ...] parts
    .replace(/\[Request ID: [^\]]+\]/g, '') // Remove [Request ID: ...] parts
    .replace(/Server Error/g, '') // Remove "Server Error" text
    .replace(/Uncaught Error:/g, '') // Remove "Uncaught Error:" text
    .replace(/Called by client/g, '') // Remove "Called by client" text
    .trim();

  // If the cleaned error is empty, use a fallback
  if (!cleanedError) {
    return ERROR_MESSAGE_MAP['Server Error'];
  }

  // Check if we have a specific mapping for this error
  for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (cleanedError.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // If no specific mapping found, return the cleaned error
  // but make sure it's user-friendly
  if (cleanedError.length < 100 && !cleanedError.includes('Error:')) {
    return cleanedError;
  }

  // For very technical or long errors, use generic message
  return ERROR_MESSAGE_MAP['Unknown error'];
}
