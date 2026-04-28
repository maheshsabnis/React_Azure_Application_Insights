/**
 * CLSSeverityTagComponent Component and Utilities
 *
 * Renders a color-coded Ant Design Tag based on Application Insights severity levels.
 * Also exports helper functions and options for use in filters and other components.
 *
 * Severity Levels:
 *   0 = Verbose (gray)
 *   1 = Information (blue)
 *   2 = Warning (orange)
 *   3 = Error (red)
 *   4 = Critical (magenta)
 */

import { Tag } from 'antd';

/** Maps severity level numbers to display labels and Ant Design tag colors. */
const severityConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Verbose', color: 'default' },
  1: { label: 'Information', color: 'blue' },
  2: { label: 'Warning', color: 'orange' },
  3: { label: 'Error', color: 'red' },
  4: { label: 'Critical', color: 'magenta' },
};

/** Props for the CLSSeverityTagComponent component. */
interface CLSSeverityTagComponentProps {
  /** The numeric severity level (0-4). */
  level: number;
  /** Whether to show the text label (true) or just the number (false). Defaults to true. */
  showLabel?: boolean;
}

/**
 * Renders a color-coded tag displaying the severity level.
 * Used in log tables and detail views to visually indicate log importance.
 */
export default function CLSSeverityTagComponent({ level, showLabel = true }: CLSSeverityTagComponentProps) {
  const config = severityConfig[level] || { label: 'Unknown', color: 'default' };
  return <Tag color={config.color}>{showLabel ? config.label : level}</Tag>;
}

/**
 * Returns the human-readable label for a severity level.
 * @param level - Numeric severity (0-4)
 * @returns Label string (e.g., "Error", "Warning")
 */
export function FNgetSeverityLabel(level: number): string {
  return severityConfig[level]?.label || 'Unknown';
}

/**
 * Returns the Ant Design tag color for a severity level.
 * @param level - Numeric severity (0-4)
 * @returns Color string for the Ant Design Tag component
 */
export function FNgetSeverityColor(level: number): string {
  return severityConfig[level]?.color || 'default';
}

/** Array of severity options for use in Select/Filter components. */
export const severityOptions = Object.entries(severityConfig).map(([value, { label }]) => ({
  value: Number(value),
  label,
}));
