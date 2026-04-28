/**
 * Traces API Service
 * Provides functions for fetching request traces and distributed trace details.
 * Calls GET /api/traces and GET /api/traces/{operationId}.
 */

import apiClient from './client';
import type { CLSTraceItem } from '../types';

/**
 * Fetches paginated request traces from the AppRequests table.
 * @param params.timeRange - Time range filter (e.g., "1h", "24h", "7d")
 * @param params.operationName - Optional filter to search within operation names
 * @param params.minDurationMs - Optional minimum duration threshold in milliseconds
 * @param params.success - Optional filter for successful (true) or failed (false) requests
 * @param params.pageSize - Number of traces per page
 * @param params.page - Zero-based page index
 * @returns Array of CLSTraceItem objects for the requested page
 */
export const FNfetchTraces = async (params: {
  timeRange?: string;
  operationName?: string;
  minDurationMs?: number;
  success?: boolean;
  pageSize?: number;
  page?: number;
}): Promise<CLSTraceItem[]> => {
  const { data } = await apiClient.get('/api/traces', { params });
  return data;
};

/**
 * Fetches all spans in a distributed trace by Operation ID.
 * Returns requests, dependencies, traces, and exceptions linked by the same operation.
 * Used for the trace waterfall visualization in the UI.
 * @param operationId - The shared Operation ID for the distributed trace
 * @returns Array of CLSTraceItem objects ordered chronologically
 */
export const FNfetchTraceDetail = async (operationId: string): Promise<CLSTraceItem[]> => {
  const { data } = await apiClient.get(`/api/traces/${operationId}`);
  return data;
};
