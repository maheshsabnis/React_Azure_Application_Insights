/**
 * CLSOverviewPageComponent Component
 *
 * The dashboard home page that displays key Application Insights metrics at a glance.
 * Layout consists of three rows:
 *   Row 1: Four stat cards — Total Requests, Avg Response Time, Failure Rate, Exceptions
 *   Row 2: Two line charts — Request Volume Over Time, Avg Response Time Over Time
 *   Row 3: Bar chart (Top Failing Endpoints) + Pie chart (Response Code Distribution)
 *
 * Data is fetched via the FNuseRequestSummary hook, which auto-refreshes every 30 seconds.
 * Uses the global time range from TimeRangeContext to filter the data.
 */

import { Col, Row, Empty, Card } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FNuseRequestSummary } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import { CLSStatCardComponent, CLSTimeSeriesChartComponent, CLSPageSpinComponent } from '../components';

/** Color palette for pie chart segments. */
const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d', '#722ed1'];

/**
 * Renders the dashboard overview with stat cards, time-series charts,
 * a bar chart of top failures, and a pie chart of response code distribution.
 */
export default function CLSOverviewPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const { data: summary, isLoading } = FNuseRequestSummary(timeRange);

  if (isLoading) return <CLSPageSpinComponent />;
  if (!summary) return <Empty description="No data available" />;

  return (
    <div>
      {/* Row 1: Key metric stat cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <CLSStatCardComponent
            title="Total Requests"
            value={summary.totalRequests}
            prefix={<ApiOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <CLSStatCardComponent
            title="Avg Response Time"
            value={summary.avgDurationMs}
            suffix="ms"
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: summary.avgDurationMs > 2000 ? '#f5222d' : '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <CLSStatCardComponent
            title="Failure Rate"
            value={summary.failureRate}
            suffix="%"
            prefix={summary.failureRate > 5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: summary.failureRate > 5 ? '#f5222d' : '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <CLSStatCardComponent
            title="Exceptions"
            value={summary.totalExceptions}
            prefix={<BugOutlined />}
            valueStyle={{ color: summary.totalExceptions > 0 ? '#faad14' : '#52c41a' }}
          />
        </Col>
      </Row>

      {/* Row 2: Time-series line charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <CLSTimeSeriesChartComponent title="Request Volume Over Time" data={summary.requestsOverTime} color="#1890ff" />
        </Col>
        <Col xs={24} lg={12}>
          <CLSTimeSeriesChartComponent title="Avg Response Time Over Time" data={summary.avgDurationOverTime} color="#faad14" />
        </Col>
      </Row>

      {/* Row 3: Bar chart (failures) + Pie chart (response codes) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Failing Endpoints">
            {summary.topFailingEndpoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.topFailingEndpoints} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f5222d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No failing endpoints" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Response Code Distribution">
            {summary.responseCodeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.responseCodeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {summary.responseCodeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No data" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
