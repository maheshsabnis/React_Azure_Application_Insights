/**
 * CLSStatCardComponent Component
 *
 * Renders a single statistic value inside an Ant Design Card.
 * Used on the Overview page to display key metrics like total requests,
 * average response time, failure rate, and exception count.
 */

import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

/** Props for the CLSStatCardComponent component. */
interface CLSStatCardComponentProps {
  /** The label displayed above the value (e.g., "Total Requests"). */
  title: string;
  /** The numeric or string value to display. */
  value: number | string;
  /** Optional unit suffix displayed after the value (e.g., "ms", "%"). */
  suffix?: string;
  /** Optional icon or element displayed before the value. */
  prefix?: ReactNode;
  /** Optional CSS styles for the value text (e.g., color for red/green indicators). */
  valueStyle?: React.CSSProperties;
  /** Optional number of decimal places for numeric values. */
  precision?: number;
}

/**
 * Displays a single statistic in a card format.
 * Wraps Ant Design's Statistic component inside a Card for consistent dashboard styling.
 */
export default function CLSStatCardComponent({ title, value, suffix, prefix, valueStyle, precision }: CLSStatCardComponentProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={valueStyle}
        precision={precision}
      />
    </Card>
  );
}
