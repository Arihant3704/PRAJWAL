/**
 * A safe wrapper around fetch that validates that the response is JSON.
 * If the response is HTML, it throws a clear diagnostic error explaining
 * that the frontend is requesting its own domain instead of the backend.
 */
export const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(
      `Secure Gateway Error: Expected JSON, but received HTML (Status ${response.status}). ` +
      `This typically happens when VITE_API_URL is not configured on Vercel, ` +
      `or is pointing to the Vercel app URL itself instead of the Render backend URL.`
    );
  }

  return response;
};
