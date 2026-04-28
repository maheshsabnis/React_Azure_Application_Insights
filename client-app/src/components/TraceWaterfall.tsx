/**
 * CLSTraceWaterfallComponent Component
 *
 * Renders a waterfall visualization of all spans in a distributed trace.
 * Each span displays:
 * - A colored type badge (request, dependency, trace, exception)
 * - The operation/dependency name and optional target
 * - Duration in milliseconds
 * - A proportional progress bar relative to the longest span
 * - Green (success) or red (failure) background and border colors
 *
 * Used in the Traces page drawer when clicking on a specific operation.
 */

import { Typography, Tag, Space, Progress } from 'antd';
import type { CLSTraceItem } from '../types';

/** Props for the CLSTraceWaterfallComponent component. */
interface CLSTraceWaterfallComponentProps {
  /** Array of spans belonging to the same distributed trace, ordered by time. */
  spans: CLSTraceItem[];
}

/**
 * Displays a waterfall view of all spans in a distributed trace.
 * The progress bar width for each span is proportional to its duration
 * relative to the longest span in the trace.
 */
export default function CLSTraceWaterfallComponent({ spans }: CLSTraceWaterfallComponentProps) {
  const maxDuration = Math.max(...spans.map(s => s.durationMs), 1);

  if (spans.length === 0) {
    return <Typography.Text type="secondary">No spans found</Typography.Text>;
  }

  return (
    <div>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        {spans.length} span(s) in this trace
      </Typography.Text>
      {spans.map((item, idx) => (
        <div
          key={idx}
          style={{
            padding: '8px 12px',
            marginBottom: 4,
            background: item.success ? '#f6ffed' : '#fff2f0',
            borderLeft: `4px solid ${item.success ? '#52c41a' : '#f5222d'}`,
            borderRadius: 4,
          }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <CLSItemTypeTagComponent type={item.itemType} />
              <Typography.Text strong>{item.name}</Typography.Text>
              {item.target && (
                <Typography.Text type="secondary"> → {item.target}</Typography.Text>
              )}
            </div>
            <Typography.Text>{item.durationMs.toFixed(0)} ms</Typography.Text>
          </Space>
          <Progress
            percent={maxDuration > 0 ? (item.durationMs / maxDuration) * 100 : 0}
            showInfo={false}
            strokeColor={item.success ? '#52c41a' : '#f5222d'}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Renders a colored tag for the telemetry item type.
 * Colors: request=blue, dependency=purple, trace=cyan, exception=red.
 */
function CLSItemTypeTagComponent({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    request: 'blue',
    dependency: 'purple',
    trace: 'cyan',
    exception: 'red',
  };
  return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
}
