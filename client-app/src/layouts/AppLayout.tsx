/**
 * CLSAppLayoutComponent Component
 *
 * The main application shell that provides the dashboard's visual structure:
 * - Collapsible sidebar with navigation menu (links to all dashboard pages)
 * - Header bar with: dashboard title, global time range selector, refresh button,
 *   dark mode toggle, and user profile dropdown with sign-out
 * - Content area that renders the active page via React Router's <Outlet />
 *
 * This layout wraps all route-level pages and is rendered as a parent route element.
 */

import { useState } from 'react';
import { Layout, Menu, Select, Button, Typography, theme, Dropdown, Avatar } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  BugOutlined,
  LineChartOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  ReloadOutlined,
  BulbOutlined,
  BulbFilled,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import { useQueryClient } from '@tanstack/react-query';

const { Header, Sider, Content } = Layout;

/** Sidebar navigation menu items mapping routes to icons and labels. */
const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Overview' },
  { key: '/logs', icon: <FileTextOutlined />, label: 'Logs' },
  { key: '/traces', icon: <ApartmentOutlined />, label: 'Traces' },
  { key: '/exceptions', icon: <BugOutlined />, label: 'Exceptions' },
  { key: '/metrics', icon: <LineChartOutlined />, label: 'Metrics' },
  { key: '/dependencies', icon: <ApiOutlined />, label: 'Dependencies' },
  { key: '/availability', icon: <CheckCircleOutlined />, label: 'Availability' },
  { key: '/kql', icon: <CodeOutlined />, label: 'KQL Query' },
];

/** Time range dropdown options for the global time filter in the header. */
const timeRangeOptions = [
  { value: '30m', label: 'Last 30 minutes' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '12h', label: 'Last 12 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

/** Props for the CLSAppLayoutComponent component. */
interface CLSAppLayoutComponentProps {
  /** Whether dark mode is currently active. */
  isDarkMode: boolean;
  /** Callback to toggle between light and dark mode. */
  toggleDarkMode: () => void;
}

/**
 * Main application layout with sidebar navigation, header controls, and content area.
 * Manages sidebar collapse state, navigation, time range selection, and user profile.
 */
export default function CLSAppLayoutComponent({ isDarkMode, toggleDarkMode }: CLSAppLayoutComponentProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { timeRange, setTimeRange } = FNuseTimeRange();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const { instance, accounts } = useMsal();

  // Extract user info from the active MSAL account
  const activeAccount = accounts[0];
  const userName = activeAccount?.name || activeAccount?.username || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  /** Signs the user out via Entra ID redirect logout. */
  const FNhandleSignOut = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  };

  /** User profile dropdown menu items. */
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Typography.Text strong>{userName}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {activeAccount?.username}
          </Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'sign-out',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: FNhandleSignOut,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Collapsible sidebar with navigation menu */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: token.colorBgContainer }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Typography.Title level={collapsed ? 5 : 4} style={{ margin: 0, color: token.colorPrimary }}>
            {collapsed ? 'AI' : 'AppInsights'}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        {/* Header with title, time range selector, refresh, dark mode toggle, and user profile */}
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            Azure Application Insights Dashboard
          </Typography.Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={timeRangeOptions}
              style={{ width: 160 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => queryClient.invalidateQueries()}
            >
              Refresh
            </Button>
            <Button
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleDarkMode}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar
                style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}
                icon={<UserOutlined />}
              >
                {userInitial}
              </Avatar>
            </Dropdown>
          </div>
        </Header>
        {/* Content area where the active page is rendered via React Router Outlet */}
        <Content style={{ margin: 16, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
