/**
 * Metrics API Service
 * Provides functions for fetching request summaries, metric definitions,
 * metric time-series data, dependency statistics, and availability test results.
 */

import apiClient from './client';
import type { CLSMetricDefinition, CLSMetricResult, CLSRequestSummary, CLSDependencyEntry, CLSAvailabilityResult } from '../types';

/**
 * Fetches the aggregated request summary for the dashboard Overview page.
 * Includes totals, time-series data, top failures, and response code distribution.
 * @param timeRange - Optional time range filter (e.g., "24h", "7d")
 * @returns A CLSRequestSummary object with all overview statistics and chart data
 */
export const FNfetchRequestSummary = async (timeRange?: string): Promise<CLSRequestSummary> => {
  const { data } = await apiClient.get('/api/requests/summary', { params: { timeRange } });
  return data;
};

/**
 * Fetches all available metric names from the AppMetrics and AppPerformanceCounters tables.
 * Used to populate the metric picker dropdown in the Metrics page.
 * @returns Array of CLSMetricDefinition objects sorted alphabetically
 */
export const FNfetchMetricDefinitions = async (): Promise<CLSMetricDefinition[]> => {
  const { data } = await apiClient.get('/api/metrics');
  return data;
};

/**
 * Fetches time-series data for a specific metric with configurable aggregation and interval.
 * @param params.metricName - The metric to query (URL-encoded automatically)
 * @param params.timeRange - Time range filter (e.g., "1h", "24h")
 * @param params.interval - Optional time bucket interval (e.g., "5m", "1h")
 * @param params.aggregation - Aggregation function: "avg", "sum", "min", "max", or "count"
 * @returns A CLSMetricResult object with time-series data points for chart rendering
 */
export const FNfetchMetric = async (params: {
  metricName: string;
  timeRange?: string;
  interval?: string;
  aggregation?: string;
}): Promise<CLSMetricResult> => {
  const { metricName, ...rest } = params;
  const { data } = await apiClient.get(`/api/metrics/${encodeURIComponent(metricName)}`, { params: rest });
  return data;
};

/**
 * Fetches paginated dependency call statistics aggregated by name and type.
 * @param params.timeRange - Time range filter
 * @param params.type - Optional dependency type filter (e.g., "SQL", "HTTP")
 * @param params.pageSize - Number of entries per page
 * @param params.page - Zero-based page index
 * @returns Array of CLSDependencyEntry objects sorted by call count descending
 */
export const FNfetchDependencies = async (params: {
  timeRange?: string;
  type?: string;
  pageSize?: number;
  page?: number;
}): Promise<CLSDependencyEntry[]> => {
  const { data } = await apiClient.get('/api/dependencies', { params });
  return data;
};

/**
 * Fetches paginated availability (web test) results.
 * @param params.timeRange - Time range filter
 * @param params.testName - Optional filter to search within test names
 * @param params.pageSize - Number of results per page
 * @param params.page - Zero-based page index
 * @returns Array of CLSAvailabilityResult objects ordered by time descending
 */
export const FNfetchAvailability = async (params: {
  timeRange?: string;
  testName?: string;
  pageSize?: number;
  page?: number;
}): Promise<CLSAvailabilityResult[]> => {
  const { data } = await apiClient.get('/api/availability', { params });
  return data;
};
