/**
 * Axios API Client with MSAL Token Interceptor
 *
 * Creates a pre-configured Axios instance that automatically attaches
 * Microsoft Entra ID (Azure AD) bearer tokens to every outgoing request.
 * The interceptor silently acquires tokens from MSAL cache, and falls back
 * to interactive login redirect if the token is expired or consent is needed.
 */

import axios from 'axios';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from '../auth/AuthProvider';
import { apiScopes } from '../auth/msalConfig';

/**
 * Pre-configured Axios instance pointing to the ASP.NET Core backend API.
 * Base URL is read from the VITE_API_URL environment variable, defaulting to localhost:5027.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5027',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Request interceptor that attaches a Bearer token to every API call.
 * - Acquires the token silently from the MSAL cache (no user interaction).
 * - If the token is expired and requires re-authentication, triggers an
 *   interactive redirect to the Entra ID login page.
 * - If no active account exists (user not logged in), the request proceeds
 *   without a token and the API will return a 401 response.
 */
apiClient.interceptors.request.use(async (config) => {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return config;
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...apiScopes,
      account,
    });
    config.headers.Authorization = `Bearer ${response.accessToken}`;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Token expired or consent needed — trigger interactive login
      await msalInstance.acquireTokenRedirect(apiScopes);
    }
    // For other errors, let the request proceed without token (will get 401)
  }

  return config;
});

export default apiClient;
