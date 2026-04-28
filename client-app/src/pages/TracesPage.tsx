/**
 * CLSTracesPageComponent Component
 *
 * Displays HTTP request traces from AppRequests with filtering and pagination.
 * Features:
 * - Search by operation name
 * - Paginated table showing timestamp, name, duration, status, response code, and operation ID
 * - Sortable duration column for finding slow requests
 * - Click on a row to open a trace waterfall drawer showing all spans in the distributed trace
 *
 * The waterfall view fetches detailed span data via FNuseTraceDetail when an operation ID is selected.
 */

import { useState } from 'react';
import { Table, Input, Space, Drawer } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FNuseTraces, FNuseTraceDetail } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';
import { CLSStatusTagComponent, CLSTraceWaterfallComponent } from '../components';
import type { CLSTraceItem } from '../types';

/**
 * Renders a paginated table of request traces with a slide-out
 * waterfall visualization for distributed trace analysis.
 */
export default function CLSTracesPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [operationName, setOperationName] = useState('');
  const [page, setPage] = useState(0);
  const [selectedOpId, setSelectedOpId] = useState('');

  const { data: traces, isLoading } = FNuseTraces({ timeRange, operationName: operationName || undefined, pageSize: 50, page });
  const { data: traceDetail, isLoading: detailLoading } = FNuseTraceDetail(selectedOpId);

  /** Table column definitions for the traces table. */
  const columns: ColumnsType<CLSTraceItem> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMs',
      width: 120,
      render: (d: number) => `${d.toFixed(0)} ms`,
      sorter: (a, b) => a.durationMs - b.durationMs,
    },
    {
      title: 'Status',
      dataIndex: 'success',
      width: 100,
      render: (s: boolean) => <CLSStatusTagComponent success={s} />,
    },
    {
      title: 'Response Code',
      dataIndex: 'resultCode',
      width: 120,
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
      {/* Operation name search filter */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by operation name..."
          onSearch={setOperationName}
          allowClear
          style={{ width: 400 }}
        />
      </Space>

      {/* Traces data table */}
      <Table<CLSTraceItem>
        columns={columns}
        dataSource={traces}
        loading={isLoading}
        rowKey={(r) => `${r.timestamp}-${r.id || r.operationId}`}
        pagination={{
          current: page + 1,
          pageSize: 50,
          onChange: (p) => setPage(p - 1),
        }}
        onRow={(record) => ({
          onClick: () => record.operationId && setSelectedOpId(record.operationId),
          style: { cursor: 'pointer' },
        })}
        size="small"
      />

      {/* Trace waterfall drawer showing all spans for the selected operation */}
      <Drawer
        title={`Trace Waterfall: ${selectedOpId}`}
        open={!!selectedOpId}
        onClose={() => setSelectedOpId('')}
        width={800}
        loading={detailLoading}
      >
        {traceDetail && <CLSTraceWaterfallComponent spans={traceDetail} />}
      </Drawer>
    </div>
  );
}
