/**
 * CLSAvailabilityPageComponent Component
 *
 * Displays availability (web test) results from the AppAvailabilityResults table.
 * Features:
 * - Duration trend line chart showing test completion times over time
 * - Filter by test name
 * - Paginated table with: Timestamp, Test Name, Location, Status (Pass/Fail), Duration, Message
 * - Color-coded status tags (green for pass, red for fail)
 */

import { useState } from 'react';
import { Table, Tag, Input, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { FNuseAvailability } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import type { CLSAvailabilityResult } from '../types';

/**
 * Renders availability test results with a duration trend chart
 * and a paginated, filterable data table.
 */
export default function CLSAvailabilityPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [testName, setTestName] = useState('');
  const [page, setPage] = useState(0);

  const { data: results, isLoading } = FNuseAvailability({ timeRange, testName: testName || undefined, pageSize: 50, page });

  /** Table column definitions for the availability results table. */
  const columns: ColumnsType<CLSAvailabilityResult> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Test Name',
      dataIndex: 'testName',
      ellipsis: true,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'success',
      width: 100,
      render: (s: boolean) => <Tag color={s ? 'green' : 'red'}>{s ? 'Pass' : 'Fail'}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMs',
      width: 120,
      render: (d: number) => `${d.toFixed(0)} ms`,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },
  ];

  // Build duration trend data for the chart (reversed to chronological order)
  const trendData = results?.map(r => ({
    time: dayjs(r.timestamp).format('HH:mm'),
    duration: r.durationMs,
    success: r.success ? 1 : 0,
  })).reverse() || [];

  return (
    <div>
      {/* Duration trend line chart */}
      {trendData.length > 0 && (
        <Card title="Availability Duration Over Time" style={{ marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="duration" stroke="#1890ff" strokeWidth={2} dot={false} name="Duration (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Test name filter */}
      <Input.Search
        placeholder="Filter by test name..."
        onSearch={setTestName}
        allowClear
        style={{ width: 400, marginBottom: 16 }}
      />

      {/* Availability results data table */}
      <Table<CLSAvailabilityResult>
        columns={columns}
        dataSource={results}
        loading={isLoading}
        rowKey={(r) => `${r.timestamp}-${r.testName}-${r.location}`}
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
