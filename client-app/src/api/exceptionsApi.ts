/**
 * Exceptions API Service
 * Provides functions for fetching individual exceptions and grouped exception summaries.
 * Calls GET /api/exceptions and GET /api/exceptions/groups.
 */

import apiClient from './client';
import type { CLSExceptionEntry, CLSExceptionGroup } from '../types';

/**
 * Fetches paginated exception entries from the AppExceptions table.
 * @param params.timeRange - Time range filter (e.g., "1h", "24h", "7d")
 * @param params.exceptionType - Optional filter to search within exception type names
 * @param params.pageSize - Number of exceptions per page
 * @param params.page - Zero-based page index
 * @returns Array of CLSExceptionEntry objects for the requested page
 */
export const FNfetchExceptions = async (params: {
  timeRange?: string;
  exceptionType?: string;
  pageSize?: number;
  page?: number;
}): Promise<CLSExceptionEntry[]> => {
  const { data } = await apiClient.get('/api/exceptions', { params });
  return data;
};

/**
 * Fetches exceptions grouped by type and message with occurrence counts.
 * Returns the top 50 exception groups sorted by frequency.
 * @param timeRange - Optional time range filter (e.g., "24h", "7d")
 * @returns Array of CLSExceptionGroup objects sorted by count descending
 */
export const FNfetchExceptionGroups = async (timeRange?: string): Promise<CLSExceptionGroup[]> => {
  const { data } = await apiClient.get('/api/exceptions/groups', { params: { timeRange } });
  return data;
};
