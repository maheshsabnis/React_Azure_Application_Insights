/**
 * Logs API Service
 * Provides functions for fetching application trace logs from the backend API.
 * Calls GET /api/logs with optional filtering and pagination parameters.
 */

import apiClient from './client';
import type { CLSLogEntry } from '../types';

/**
 * Fetches paginated application trace logs from the AppTraces table.
 * @param params.timeRange - Time range filter (e.g., "1h", "24h", "7d")
 * @param params.severity - Optional severity level (0-4) to filter by
 * @param params.search - Optional text to search within log messages
 * @param params.pageSize - Number of entries per page (default: 50)
 * @param params.page - Zero-based page index (default: 0)
 * @returns Array of CLSLogEntry objects for the requested page
 */
export const FNfetchLogs = async (params: {
  timeRange?: string;
  severity?: number;
  search?: string;
  pageSize?: number;
  page?: number;
}): Promise<CLSLogEntry[]> => {
  const { data } = await apiClient.get('/api/logs', { params });
  return data;
};
