/**
 * CLSDependenciesPageComponent Component
 *
 * Displays external dependency call statistics from the AppDependencies table.
 * Features:
 * - Bar chart: Top 10 slowest dependencies (by average duration)
 * - Pie chart: Call distribution grouped by dependency type (SQL, HTTP, etc.)
 * - Paginated data table with columns: Name, Type, Avg Duration, Failure Rate, Call Count
 * - Color-coded failure rate tags (green/orange/red)
 * - Sortable columns for duration, failure rate, and call count
 */

import { useState } from 'react';
import { Table, Tag, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FNuseDependencies } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import type { CLSDependencyEntry } from '../types';

/** Color palette for the dependency type pie chart. */
const COLORS = ['#1890ff', '#722ed1', '#13c2c2', '#faad14', '#f5222d', '#52c41a', '#eb2f96', '#fa8c16'];

/**
 * Renders dependency analytics with charts and a detailed data table.
 */
export default function CLSDependenciesPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [page, setPage] = useState(0);

  const { data: deps, isLoading } = FNuseDependencies({ timeRange, pageSize: 50, page });

  /** Table column definitions for the dependencies table. */
  const columns: ColumnsType<CLSDependencyEntry> = [
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 120,
      render: (t: string) => <Tag color="purple">{t}</Tag>,
    },
    {
      title: 'Avg Duration',
      dataIndex: 'avgDurationMs',
      width: 130,
      render: (d: number) => `${d.toFixed(0)} ms`,
      sorter: (a, b) => a.avgDurationMs - b.avgDurationMs,
    },
    {
      title: 'Failure Rate',
      dataIndex: 'failureRate',
      width: 120,
      render: (r: number) => <Tag color={r > 10 ? 'red' : r > 0 ? 'orange' : 'green'}>{r.toFixed(1)}%</Tag>,
      sorter: (a, b) => a.failureRate - b.failureRate,
    },
    {
      title: 'Call Count',
      dataIndex: 'callCount',
      width: 110,
      sorter: (a, b) => a.callCount - b.callCount,
      defaultSortOrder: 'descend',
    },
  ];

  // Top 10 slowest dependencies for bar chart
  const topSlowest = [...(deps || [])].sort((a, b) => b.avgDurationMs - a.avgDurationMs).slice(0, 10);

  // Group call counts by dependency type for pie chart
  const typeGroups: Record<string, number> = {};
  deps?.forEach(d => { typeGroups[d.type] = (typeGroups[d.type] || 0) + d.callCount; });
  const pieData = Object.entries(typeGroups).map(([name, value]) => ({ name, value }));

  return (
    <div>
      {/* Charts row: Bar chart (slowest) + Pie chart (by type) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top 10 Slowest Dependencies">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSlowest} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgDurationMs" fill="#722ed1" name="Avg Duration (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Calls by Dependency Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Dependencies data table */}
      <Table<CLSDependencyEntry>
        columns={columns}
        dataSource={deps}
        loading={isLoading}
        rowKey={(r) => `${r.name}-${r.type}`}
        pagination={{
          current: page + 1,
          pageSize: 50,
          onChange: (p) => setPage(p - 1),
        }}
        size="small"
      />
    </div>
  );
}
