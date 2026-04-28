/**
 * CLSLogsPageComponent Component
 *
 * Interactive log explorer for viewing application trace logs from AppTraces.
 * Features:
 * - Text search within log messages
 * - Severity level filter (clickable tag buttons)
 * - Paginated table with sortable columns
 * - Click-to-open detail drawer showing full log information including custom dimensions
 *
 * Data is fetched via the FNuseLogs hook with the global time range and local filter state.
 */

import { useState } from 'react';
import { Table, Input, Space, Drawer, Typography, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FNuseLogs } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import { CLSSeverityTagComponent, CLSSeverityFilterComponent } from '../components';
import type { CLSLogEntry } from '../types';

/**
 * Renders a searchable, filterable table of application logs
 * with a slide-out detail drawer for viewing individual log entries.
 */
export default function CLSLogsPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<CLSLogEntry | null>(null);

  const { data: logs, isLoading } = FNuseLogs({ timeRange, severity, search: search || undefined, pageSize: 50, page });

  /** Table column definitions for the logs table. */
  const columns: ColumnsType<CLSLogEntry> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Severity',
      dataIndex: 'severityLevel',
      width: 120,
      render: (level: number) => <CLSSeverityTagComponent level={level} />,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'appRoleName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Operation ID',
      dataIndex: 'operationId',
      width: 200,
      ellipsis: true,
    },
  ];

  return (
    <div>
      {/* Search and severity filter controls */}
      <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
        <Space wrap>
          <Input.Search
            placeholder="Search logs..."
            onSearch={setSearch}
            allowClear
            style={{ width: 400 }}
          />
          <CLSSeverityFilterComponent value={severity} onChange={setSeverity} />
        </Space>
      </Space>

      {/* Logs data table with pagination and row click handler */}
      <Table<CLSLogEntry>
        columns={columns}
        dataSource={logs}
        loading={isLoading}
        rowKey={(r) => `${r.timestamp}-${r.operationId}-${r.message?.substring(0, 20)}`}
        pagination={{
          current: page + 1,
          pageSize: 50,
          onChange: (p) => setPage(p - 1),
          showSizeChanger: false,
        }}
        onRow={(record) => ({
          onClick: () => setSelectedLog(record),
          style: { cursor: 'pointer' },
        })}
        size="small"
        scroll={{ y: 'calc(100vh - 340px)' }}
      />

      {/* Detail drawer showing full log entry information */}
      <Drawer
        title="Log Details"
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        width={600}
      >
        {selectedLog && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Timestamp">{dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}</Descriptions.Item>
            <Descriptions.Item label="Severity"><CLSSeverityTagComponent level={selectedLog.severityLevel} /></Descriptions.Item>
            <Descriptions.Item label="Message"><Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedLog.message}</Typography.Paragraph></Descriptions.Item>
            <Descriptions.Item label="Operation ID">{selectedLog.operationId}</Descriptions.Item>
            <Descriptions.Item label="Operation Name">{selectedLog.operationName}</Descriptions.Item>
            <Descriptions.Item label="Role Name">{selectedLog.appRoleName}</Descriptions.Item>
            {selectedLog.customDimensions && (
              <Descriptions.Item label="Custom Dimensions">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace', fontSize: 12 }}>
                  {selectedLog.customDimensions}
                </Typography.Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
