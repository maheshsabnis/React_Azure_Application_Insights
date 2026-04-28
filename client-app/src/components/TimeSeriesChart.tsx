/**
 * CLSTimeSeriesChartComponent Component
 *
 * A reusable chart component that renders time-series data as either a line chart
 * or an area chart using Recharts. Wraps the chart in an Ant Design Card with a title.
 * Automatically formats timestamps for the X-axis using dayjs.
 *
 * Used across dashboard pages for rendering request volume, response time trends,
 * and availability duration over time.
 */

import { Card, Empty } from 'antd';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import type { CLSTimeSeriesPoint } from '../types';

/** Props for the CLSTimeSeriesChartComponent component. */
interface CLSTimeSeriesChartComponentProps {
  /** Card title displayed above the chart. */
  title: string;
  /** Array of time-series data points to plot. */
  data: CLSTimeSeriesPoint[];
  /** Optional Recharts data key (not used externally — value is always "value"). */
  dataKey?: string;
  /** Chart line/area color. Defaults to "#1890ff" (Ant Design primary blue). */
  color?: string;
  /** Chart type: "line" or "area". Defaults to "line". */
  type?: 'line' | 'area';
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
  /** dayjs format string for X-axis time labels. Defaults to "HH:mm". */
  timeFormat?: string;
  /** Optional Y-axis label (not currently rendered but available for future use). */
  yAxisLabel?: string;
}

/**
 * Renders time-series data in a responsive line or area chart.
 * Shows an "Empty" placeholder when no data is available.
 */
export default function CLSTimeSeriesChartComponent({
  title,
  data,
  color = '#1890ff',
  type = 'line',
  height = 300,
  timeFormat = 'HH:mm',
}: CLSTimeSeriesChartComponentProps) {
  const chartData = data.map(p => ({
    time: dayjs(p.timestamp).format(timeFormat),
    value: p.value,
  }));

  if (chartData.length === 0) {
    return (
      <Card title={title}>
        <Empty description="No data available" />
      </Card>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {type === 'area' ? (
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
          ) : (
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  );
}
