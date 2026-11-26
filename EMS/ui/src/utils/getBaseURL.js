// src/utils/getBaseURL.js

/**
 * Get the appropriate base URL based on the application stage
 * @returns {string} The base URL for API calls
 */
const getBaseURL = () => {
  const stage = import.meta.env.VITE_APP_STAGE;
  const localURL = import.meta.env.VITE_API_BASE_URL_LOCAL;
  const liveURL = import.meta.env.VITE_API_BASE_URL_LIVE;

  // Determine base URL based on stage
  let baseURL;

  if (stage === 'development') {
    baseURL = localURL || 'http://localhost:5001/api';
  } else if (stage === 'production') {
    baseURL = liveURL || '/api';
  } else {
    baseURL = liveURL || localURL || '/api';
  }

  // Ensure /api is present because backend routes are prefixed with /api (e.g. /api/Login)
  if (!baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = `${baseURL.replace(/\/$/, '')}/api`;
  }

  // Validate that we have a URL
  if (!baseURL) {
    console.error('No base URL found. Check your environment variables.');
    throw new Error('API base URL is not configured properly.');
  }

  // Remove trailing slash if present for consistency
  baseURL = baseURL.replace(/\/$/, '');

  // Log current configuration (only in development)
  // if (import.meta.env.DEV) {
  //   console.log(`🌐 API Base URL (${stage}):`, baseURL);
  // }

  return baseURL;
};

export default getBaseURL;