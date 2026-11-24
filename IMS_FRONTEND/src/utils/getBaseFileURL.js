/**
 * Get the appropriate base URL for file access (excluding `/api`)
 * @returns {string} The base URL for file paths
 */
const getBaseFileURL = () => {
  const stage = import.meta.env.VITE_APP_STAGE;
  const localURL = import.meta.env.VITE_API_BASE_URL_LOCAL;
  const liveURL = import.meta.env.VITE_API_BASE_URL_LIVE;
  const testLiveURL = import.meta.env.VITE_API_BASE_URL_TEST_LIVE;

  let rawURL;

  if (stage === 'development') {
    rawURL = localURL;
  } else if (stage === 'production') {
    rawURL = liveURL;
  } else if (stage === 'livetest') {
    rawURL = testLiveURL;
  } else {
    console.warn(`Unknown VITE_APP_STAGE: ${stage}. Falling back to local URL.`);
    rawURL = localURL;
  }

  // Remove trailing '/api' if present in either environment
  let baseURL = (rawURL || 'http://localhost:4000/api/v1').replace(/\/api\/v\d+\/?$/, '').replace(/\/api\/?$/, '');

  // Remove trailing slash for consistency
  baseURL = baseURL.replace(/\/$/, '');

  return baseURL;
};

export default getBaseFileURL;
