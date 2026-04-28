/**
 * MSAL (Microsoft Authentication Library) Configuration
 *
 * Defines the configuration for authenticating users with Microsoft Entra ID (Azure AD).
 * Uses MSAL.js v3 browser library for the OAuth 2.0 Authorization Code flow with PKCE.
 * Configuration values are read from Vite environment variables (VITE_AZURE_*).
 */

import type { Configuration } from '@azure/msal-browser';
import { LogLevel } from '@azure/msal-browser';

/**
 * MSAL configuration object for the PublicClientApplication.
 * - clientId: The SPA's App Registration Client ID in Entra ID
 * - authority: The Entra ID tenant-specific login endpoint
 * - redirectUri: Where Entra ID redirects after authentication (current origin)
 * - cacheLocation: Uses localStorage to persist tokens across browser tabs
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

/**
 * Scopes requested when the React SPA calls the backend API.
 * Must match the scope exposed by the API's App Registration in Entra ID.
 */
export const apiScopes = {
  scopes: [import.meta.env.VITE_API_SCOPE || 'api://appinsights-dashboard/access_as_user'],
};

/**
 * Scopes requested during the initial login.
 * Includes OpenID Connect scopes (openid, profile, email) plus the API access scope.
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', ...apiScopes.scopes],
};
