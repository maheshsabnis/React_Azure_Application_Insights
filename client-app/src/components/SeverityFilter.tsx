/**
 * CLSSeverityFilterComponent Component
 *
 * Renders a row of clickable severity level tags that act as toggle filters.
 * Clicking a tag selects that severity level; clicking again deselects it.
 * Used on the Logs page to filter log entries by severity level.
 */

import { Tag, Space } from 'antd';
import { FNgetSeverityColor, severityOptions } from './SeverityTag';

/** Props for the CLSSeverityFilterComponent component. */
interface CLSSeverityFilterComponentProps {
  /** Currently selected severity level, or undefined if no filter is active. */
  value?: number;
  /** Callback fired when a severity level is selected or deselected. */
  onChange: (value: number | undefined) => void;
}

/**
 * Toggleable severity filter using colored tags.
 * The selected tag is highlighted with its severity color; unselected tags are neutral.
 */
export default function CLSSeverityFilterComponent({ value, onChange }: CLSSeverityFilterComponentProps) {
  return (
    <Space>
      {severityOptions.map((opt) => (
        <Tag
          key={opt.value}
          color={value === opt.value ? FNgetSeverityColor(opt.value) : undefined}
          style={{ cursor: 'pointer' }}
          onClick={() => onChange(value === opt.value ? undefined : opt.value)}
        >
          {opt.label}
        </Tag>
      ))}
    </Space>
  );
}
