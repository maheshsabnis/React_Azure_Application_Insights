/**
 * Root Application Component
 *
 * Composes the full application by nesting all required providers and defining routes.
 * Provider hierarchy (outermost to innermost):
 * 1. CLSAuthProviderComponent — Initializes MSAL and provides authentication context
 * 2. QueryClientProvider — Provides TanStack Query caching and state management
 * 3. ConfigProvider — Ant Design theme (supports light/dark mode toggle)
 * 4. CLSAuthGuardComponent — Blocks unauthenticated access, shows sign-in screen
 * 5. TimeRangeContext — Global time range filter shared across all pages
 * 6. BrowserRouter + Routes — Client-side routing to dashboard pages
 *
 * The CLSAppLayoutComponent component provides the sidebar, header, and content area.
 * Each route renders inside the layout's <Outlet /> slot.
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { CLSAuthProviderComponent, CLSAuthGuardComponent } from './auth';
import { TimeRangeContext, FNuseTimeRangeState } from './hooks/useTimeRange';
import CLSAppLayoutComponent from './layouts/AppLayout';
import CLSOverviewPageComponent from './pages/OverviewPage';
import CLSLogsPageComponent from './pages/LogsPage';
import CLSTracesPageComponent from './pages/TracesPage';
import CLSExceptionsPageComponent from './pages/ExceptionsPage';
import CLSMetricsPageComponent from './pages/MetricsPage';
import CLSDependenciesPageComponent from './pages/DependenciesPage';
import CLSAvailabilityPageComponent from './pages/AvailabilityPage';
import CLSKqlPageComponent from './pages/KqlPage';

/**
 * TanStack Query client with default options:
 * - staleTime: 30s before data is considered stale and eligible for background refetch
 * - retry: 1 retry on failure
 * - refetchOnWindowFocus: disabled to avoid unnecessary API calls
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Root component that wires together authentication, data fetching,
 * theming, and routing for the Application Insights Dashboard.
 */
export default function App() {
  const timeRangeState = FNuseTimeRangeState();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <CLSAuthProviderComponent>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: { colorPrimary: '#1890ff' },
          }}
        >
          <CLSAuthGuardComponent>
            <TimeRangeContext.Provider value={timeRangeState}>
              <BrowserRouter>
                <Routes>
                  <Route element={<CLSAppLayoutComponent isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}>
                    <Route path="/" element={<CLSOverviewPageComponent />} />
                    <Route path="/logs" element={<CLSLogsPageComponent />} />
                    <Route path="/traces" element={<CLSTracesPageComponent />} />
                    <Route path="/exceptions" element={<CLSExceptionsPageComponent />} />
                    <Route path="/metrics" element={<CLSMetricsPageComponent />} />
                    <Route path="/dependencies" element={<CLSDependenciesPageComponent />} />
                    <Route path="/availability" element={<CLSAvailabilityPageComponent />} />
                    <Route path="/kql" element={<CLSKqlPageComponent />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TimeRangeContext.Provider>
          </CLSAuthGuardComponent>
        </ConfigProvider>
      </QueryClientProvider>
    </CLSAuthProviderComponent>
  );
}
