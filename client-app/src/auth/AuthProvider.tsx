/**
 * MSAL Authentication Provider Component
 *
 * Wraps the entire application in the MSAL React context, enabling authentication
 * with Microsoft Entra ID throughout the component tree. This component:
 * 1. Initializes the MSAL PublicClientApplication (required for MSAL v3+)
 * 2. Handles redirect responses after returning from the Entra ID login page
 * 3. Sets the first available account as the active account
 * 4. Listens for future login events to update the active account
 * 5. Shows a loading spinner until MSAL initialization is complete
 */

import { useState, useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { Spin } from 'antd';
import type { ReactNode } from 'react';
import { msalConfig } from './msalConfig';

/**
 * Singleton MSAL PublicClientApplication instance.
 * Exported so the API client interceptor can acquire tokens silently.
 */
export const msalInstance = new PublicClientApplication(msalConfig);

/** Props for the CLSAuthProviderComponent component. */
interface CLSAuthProviderComponentProps {
  /** Child components that will have access to the MSAL authentication context. */
  children: ReactNode;
}

/**
 * Authentication provider that initializes MSAL and wraps children in MsalProvider.
 * Displays a centered spinner while MSAL is initializing and processing any pending redirects.
 */
export default function CLSAuthProviderComponent({ children }: CLSAuthProviderComponentProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // MSAL v3+ requires explicit initialization before any other operations
      await msalInstance.initialize();

      // Process the redirect response if returning from Entra ID login
      await msalInstance.handleRedirectPromise();

      // Set the first account as active if the user is already logged in
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }

      // Listen for future login events to update the active account
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as { account: any };
          msalInstance.setActiveAccount(payload.account);
        }
      });

      setIsReady(true);
    };

    init();
  }, []);

  if (!isReady) {
    return <Spin size="large" style={{ display: 'block', margin: '200px auto' }} />;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
