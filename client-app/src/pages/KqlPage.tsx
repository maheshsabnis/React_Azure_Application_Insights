/**
 * CLSKqlPageComponent Component
 *
 * Interactive KQL (Kusto Query Language) query editor page.
 * Features:
 * - Monaco Editor (VS Code editor) for writing KQL queries
 * - Ctrl+Enter keyboard shortcut to execute queries
 * - Configurable time span for query execution
 * - Dynamic result table with columns derived from the query output
 * - Saved queries sidebar (load, save, delete queries)
 * - CSV export of query results
 * - TanStack Query mutations for query execution and saved query management
 *
 * This page communicates with the POST /api/kql endpoint, which validates
 * queries for safety (blocking dangerous management commands) before execution.
 */

import { useState, useCallback } from 'react';
import { Card, Button, Table, Space, Select, message, Modal, Input, List, Typography, Popconfirm, Spin } from 'antd';
import { PlayCircleOutlined, SaveOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FNexecuteKql, FNsaveQuery, FNdeleteSavedQuery } from '../api/kqlApi';
import { FNuseSavedQueries } from '../hooks/useApiQueries';
import type { CLSKqlResult, CLSSavedQuery } from '../types';

/** Time span options for the query execution dropdown. */
const timeSpanOptions = [
  { value: '30m', label: 'Last 30 minutes' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

/**
 * Renders a full-featured KQL query editor with saved queries sidebar,
 * Monaco Editor, execution controls, and a dynamic result table.
 */
export default function CLSKqlPageComponent() {
  const [query, setQuery] = useState('AppRequests\n| summarize count() by Name\n| order by count_ desc\n| take 10');
  const [timeSpan, setTimeSpan] = useState('24h');
  const [result, setResult] = useState<CLSKqlResult | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const queryClient = useQueryClient();
  const { data: savedQueries } = FNuseSavedQueries();

  /** Mutation for executing KQL queries against the backend. */
  const executeMutation = useMutation({
    mutationFn: () => FNexecuteKql(query, timeSpan),
    onSuccess: (data) => setResult(data),
    onError: (err: any) => message.error(err.response?.data?.detail || 'Query failed'),
  });

  /** Mutation for saving a named query to the server. */
  const saveMutation = useMutation({
    mutationFn: () => FNsaveQuery({ name: saveName, query, description: saveDesc }),
    onSuccess: () => {
      message.success('Query saved');
      setSaveModalOpen(false);
      setSaveName('');
      setSaveDesc('');
      queryClient.invalidateQueries({ queryKey: ['savedQueries'] });
    },
  });

  /** Mutation for deleting a saved query by ID. */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => FNdeleteSavedQuery(id),
    onSuccess: () => {
      message.success('Query deleted');
      queryClient.invalidateQueries({ queryKey: ['savedQueries'] });
    },
  });

  /** Executes the current query if it's non-empty. */
  const FNhandleRunQuery = useCallback(() => {
    if (query.trim()) executeMutation.mutate();
  }, [query, executeMutation]);

  /** Registers the Ctrl+Enter keyboard shortcut in the Monaco Editor. */
  const FNhandleEditorMount = useCallback((editor: any) => {
    editor.addCommand(2048 | 3, () => { // Ctrl+Enter
      FNhandleRunQuery();
    });
  }, [FNhandleRunQuery]);

  /** Exports the current query results as a downloadable CSV file. */
  const FNexportCsv = () => {
    if (!result) return;
    const header = result.columns.map(c => c.name).join(',');
    const rows = result.rows.map(r => r.map(v => `"${v ?? ''}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kql-result.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build dynamic table columns from the KQL result schema
  const resultColumns = result?.columns.map(col => ({
    title: col.name,
    dataIndex: col.name,
    key: col.name,
    ellipsis: true,
  })) || [];

  // Transform row arrays into objects keyed by column name for the Ant Design Table
  const resultData = result?.rows.map((row, idx) => {
    const obj: Record<string, any> = { _key: idx };
    result.columns.forEach((col, i) => { obj[col.name] = row[i]; });
    return obj;
  }) || [];

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 160px)' }}>
      {/* Saved Queries Sidebar */}
      <Card title="Saved Queries" style={{ width: 280, overflow: 'auto', flexShrink: 0 }} size="small">
        <List
          dataSource={savedQueries}
          renderItem={(item: CLSSavedQuery) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 0' }}
              onClick={() => setQuery(item.query)}
              actions={[
                <Popconfirm
                  key="del"
                  title="Delete this query?"
                  onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(item.id); }}
                >
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={e => e.stopPropagation()} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<Typography.Text ellipsis>{item.name}</Typography.Text>}
                description={<Typography.Text type="secondary" ellipsis style={{ fontSize: 11 }}>{item.description}</Typography.Text>}
              />
            </List.Item>
          )}
          size="small"
        />
      </Card>

      {/* Main Editor + Results Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Monaco Editor Card */}
        <Card size="small" style={{ flexShrink: 0 }}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
            <Editor
              height="200px"
              language="plaintext"
              value={query}
              onChange={(v) => setQuery(v || '')}
              onMount={FNhandleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>
          <Space style={{ marginTop: 12 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={FNhandleRunQuery}
              loading={executeMutation.isPending}
            >
              Run Query (Ctrl+Enter)
            </Button>
            <Select value={timeSpan} onChange={setTimeSpan} options={timeSpanOptions} style={{ width: 150 }} />
            <Button icon={<SaveOutlined />} onClick={() => setSaveModalOpen(true)}>Save</Button>
            {result && <Button icon={<DownloadOutlined />} onClick={FNexportCsv}>Export CSV</Button>}
          </Space>
        </Card>

        {/* Query Results Table */}
        <Card
          title={result ? `Results (${result.rowCount} rows)` : 'Results'}
          size="small"
          style={{ flex: 1, overflow: 'auto' }}
        >
          {executeMutation.isPending ? (
            <Spin style={{ display: 'block', margin: '40px auto' }} />
          ) : result ? (
            <Table
              columns={resultColumns}
              dataSource={resultData}
              rowKey="_key"
              size="small"
              pagination={{ pageSize: 100 }}
              scroll={{ x: 'max-content' }}
            />
          ) : (
            <Typography.Text type="secondary">Run a query to see results</Typography.Text>
          )}
        </Card>
      </div>

      {/* Save Query Modal */}
      <Modal
        title="Save Query"
        open={saveModalOpen}
        onOk={() => saveMutation.mutate()}
        onCancel={() => setSaveModalOpen(false)}
        confirmLoading={saveMutation.isPending}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="Query name" value={saveName} onChange={e => setSaveName(e.target.value)} />
          <Input.TextArea placeholder="Description (optional)" value={saveDesc} onChange={e => setSaveDesc(e.target.value)} rows={2} />
        </Space>
      </Modal>
    </div>
  );
}
