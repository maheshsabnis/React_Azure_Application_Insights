/**
 * CLSExceptionsPageComponent Component
 *
 * Displays exception telemetry from the AppExceptions table with two views:
 * 1. "All Exceptions" tab — Paginated table of individual exception entries
 * 2. "Grouped by Type" tab — Aggregated view showing exception types with counts
 *
 * Features:
 * - Exception distribution chart (top 10 types by frequency)
 * - Click on an exception to open a detail drawer with stack trace
 * - Sortable columns in the grouped view
 */

import { useState } from 'react';
import { Table, Tag, Tabs, Drawer, Typography, Descriptions, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { FNuseExceptions, FNuseExceptionGroups } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import type { CLSExceptionEntry, CLSExceptionGroup } from '../types';

/**
 * Renders exception data with distribution chart, tabbed list/grouped views,
 * and a detail drawer showing stack traces for individual exceptions.
 */
export default function CLSExceptionsPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [page, setPage] = useState(0);
  const [selectedEx, setSelectedEx] = useState<CLSExceptionEntry | null>(null);

  const { data: exceptions, isLoading } = FNuseExceptions({ timeRange, pageSize: 50, page });
  const { data: groups, isLoading: groupsLoading } = FNuseExceptionGroups(timeRange);

  /** Column definitions for the individual exceptions table. */
  const exColumns: ColumnsType<CLSExceptionEntry> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Type',
      dataIndex: 'exceptionType',
      width: 250,
      ellipsis: true,
      render: (t: string) => <Tag color="red">{t}</Tag>,
    },
    {
      title: 'Message',
      dataIndex: 'outerMessage',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'appRoleName',
      width: 150,
    },
  ];

  /** Column definitions for the grouped exceptions table. */
  const groupColumns: ColumnsType<CLSExceptionGroup> = [
    {
      title: 'Exception Type',
      dataIndex: 'exceptionType',
      ellipsis: true,
      render: (t: string) => <Tag color="red">{t}</Tag>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: 'Count',
      dataIndex: 'count',
      width: 100,
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  // Build chart data from top 10 exception groups (short type names for readability)
  const trendData = groups?.slice(0, 10).map(g => ({
    type: g.exceptionType.split('.').pop(),
    count: g.count,
  })) || [];

  return (
    <div>
      {/* Exception distribution chart */}
      {trendData.length > 0 && (
        <Card title="Exception Distribution" style={{ marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f5222d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tabbed view: All Exceptions / Grouped by Type */}
      <Tabs defaultActiveKey="list" items={[
        {
          key: 'list',
          label: 'All Exceptions',
          children: (
            <Table<CLSExceptionEntry>
              columns={exColumns}
              dataSource={exceptions}
              loading={isLoading}
              rowKey={(r) => `${r.timestamp}-${r.exceptionType}-${r.operationId}`}
              pagination={{
                current: page + 1,
                pageSize: 50,
                onChange: (p) => setPage(p - 1),
              }}
              onRow={(record) => ({
                onClick: () => setSelectedEx(record),
                style: { cursor: 'pointer' },
              })}
              size="small"
            />
          ),
        },
        {
          key: 'grouped',
          label: 'Grouped by Type',
          children: (
            <Table<CLSExceptionGroup>
              columns={groupColumns}
              dataSource={groups}
              loading={groupsLoading}
              rowKey={(r) => `${r.exceptionType}-${r.message}`}
              size="small"
            />
          ),
        },
      ]} />

      {/* Exception detail drawer with stack trace */}
      <Drawer
        title="Exception Details"
        open={!!selectedEx}
        onClose={() => setSelectedEx(null)}
        width={700}
      >
        {selectedEx && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Timestamp">{dayjs(selectedEx.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}</Descriptions.Item>
            <Descriptions.Item label="Type"><Tag color="red">{selectedEx.exceptionType}</Tag></Descriptions.Item>
            <Descriptions.Item label="Message">{selectedEx.outerMessage || selectedEx.message}</Descriptions.Item>
            <Descriptions.Item label="Operation ID">{selectedEx.operationId}</Descriptions.Item>
            <Descriptions.Item label="Role Name">{selectedEx.appRoleName}</Descriptions.Item>
            {selectedEx.stackTrace && (
              <Descriptions.Item label="Stack Trace">
                <Typography.Paragraph
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    maxHeight: 400,
                    overflow: 'auto',
                    margin: 0,
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                  }}
                >
                  {selectedEx.stackTrace}
                </Typography.Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
