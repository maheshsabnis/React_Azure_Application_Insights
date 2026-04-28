/**
 * CLSMetricsPageComponent Component
 *
 * Interactive metric explorer that allows users to:
 * 1. Select a metric from a searchable dropdown (populated from AppMetrics/AppPerformanceCounters)
 * 2. Choose an aggregation function (avg, sum, min, max, count)
 * 3. Optionally set a custom time bucket interval
 * 4. View the resulting time-series data as a responsive area chart
 *
 * Uses the global time range from TimeRangeContext and fetches data via FNuseMetric hook.
 */

import { useState } from 'react';
import { Card, Select, Space, Spin, Empty } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { FNuseMetricDefinitions, FNuseMetric } from '../hooks/useApiQueries';
import { FNuseTimeRange } from '../hooks/useTimeRange';

/** Available aggregation options for the metric query. */
const aggregationOptions = [
  { value: 'avg', label: 'Average' },
  { value: 'sum', label: 'Sum' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' },
];

/** Available time bucket interval options for the metric query. */
const intervalOptions = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '1d', label: '1 day' },
];

/**
 * Renders a metric explorer with dropdown selectors and an area chart.
 * The chart updates automatically when the metric, aggregation, interval, or time range changes.
 */
export default function CLSMetricsPageComponent() {
  const { timeRange } = FNuseTimeRange();
  const [metricName, setMetricName] = useState('');
  const [aggregation, setAggregation] = useState('avg');
  const [interval, setInterval] = useState<string | undefined>();

  const { data: definitions, isLoading: defsLoading } = FNuseMetricDefinitions();
  const { data: metricResult, isLoading: metricLoading } = FNuseMetric({
    metricName,
    timeRange,
    interval,
    aggregation,
  });

  // Transform time-series data for Recharts
  const chartData = metricResult?.timeseries.map(p => ({
    time: dayjs(p.timestamp).format('MM-DD HH:mm'),
    value: p.value ?? 0,
  })) || [];

  return (
    <div>
      {/* Metric selection controls */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Select
            showSearch
            placeholder="Select a metric"
            value={metricName || undefined}
            onChange={setMetricName}
            loading={defsLoading}
            style={{ width: 350 }}
            options={definitions?.map(d => ({ value: d.name, label: d.displayName || d.name }))}
            filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          />
          <Select
            value={aggregation}
            onChange={setAggregation}
            options={aggregationOptions}
            style={{ width: 130 }}
          />
          <Select
            value={interval}
            onChange={setInterval}
            options={intervalOptions}
            placeholder="Auto interval"
            allowClear
            style={{ width: 150 }}
          />
        </Space>
      </Card>

      {/* Metric area chart */}
      <Card title={metricName ? `${metricName} (${aggregation})` : 'Select a metric to view'}>
        {metricLoading ? (
          <Spin style={{ display: 'block', margin: '60px auto' }} />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#1890ff" fill="#1890ff" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty description={metricName ? 'No data for this metric' : 'Choose a metric from the dropdown above'} />
        )}
      </Card>
    </div>
  );
}
