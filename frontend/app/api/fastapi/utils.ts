/**
 * Utility functions for API calls
 */

/**
 * Returns the base URL for API requests based on environment
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  // Development environment: use localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  
  // Production environment: use absolute URL based on window location
  // or fall back to configured URL
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  }
  
  // Default to environment variable or production URL
  return process.env.NEXT_PUBLIC_API_URL || '';
}
