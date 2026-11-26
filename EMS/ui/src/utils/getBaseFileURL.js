/**
 * Get the appropriate base URL for file access (excluding `/api`)
 * @returns {string} The base URL for file paths
 */
const getBaseFileURL = () => {
  const stage = import.meta.env.VITE_APP_STAGE;
  const localURL = import.meta.env.VITE_API_BASE_URL_LOCAL;
  const liveURL = import.meta.env.VITE_API_BASE_URL_LIVE;

  let rawURL;

  if (stage === 'development') {
    rawURL = localURL || 'http://localhost:5001';
  } else if (stage === 'production') {
    rawURL = liveURL || (typeof window !== 'undefined' ? window.location.origin : 'https://ems.prodevsphere.in');
  } else {
    rawURL = liveURL || localURL || (typeof window !== 'undefined' ? window.location.origin : 'https://ems.prodevsphere.in');
  }

  // Remove trailing '/api' if present in either environment
  let baseURL = rawURL.replace(/\/api\/?$/, '');

  // Remove trailing slash for consistency
  baseURL = baseURL.replace(/\/$/, '');

  // if (import.meta.env.DEV) {
  //   console.log(`📁 File Base URL (${stage}):`, baseURL);
  // }

  return baseURL;
};

export default getBaseFileURL;
