/**
 * Authentication Guard Component
 *
 * Protects the dashboard by rendering children only when the user is authenticated.
 * If authentication is in progress, shows a loading spinner.
 * If the user is not authenticated, shows a sign-in screen with a
 * "Sign in with Microsoft" button that triggers an Entra ID redirect login.
 */

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Button, Result, Spin } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { loginRequest } from './msalConfig';

/** Props for the CLSAuthGuardComponent component. */
interface CLSAuthGuardComponentProps {
  /** Child components to render when the user is authenticated. */
  children: ReactNode;
}

/**
 * Renders children only if the user is authenticated via Entra ID.
 * Shows a spinner during authentication interactions, or a sign-in page if not authenticated.
 */
export default function CLSAuthGuardComponent({ children }: CLSAuthGuardComponentProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  // Show spinner while MSAL is processing a login/logout/token operation
  if (inProgress !== InteractionStatus.None) {
    return <Spin size="large" style={{ display: 'block', margin: '200px auto' }} />;
  }

  // Show sign-in screen for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Result
          title="Azure Application Insights Dashboard"
          subTitle="Sign in with your Microsoft Entra ID account to access the dashboard."
          extra={
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => instance.loginRedirect(loginRequest)}
            >
              Sign in with Microsoft
            </Button>
          }
        />
      </div>
    );
  }

  // User is authenticated — render the protected content
  return <>{children}</>;
}
