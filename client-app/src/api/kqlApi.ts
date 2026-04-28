/**
 * KQL API Service
 * Provides functions for executing raw KQL queries and managing saved queries.
 * Calls POST /api/kql, GET/POST/DELETE /api/kql/saved.
 */

import apiClient from './client';
import type { CLSKqlResult, CLSSavedQuery } from '../types';

/**
 * Executes a raw KQL query against the Log Analytics Workspace.
 * The backend validates the query for safety before execution.
 * @param query - The KQL query string to execute
 * @param timeSpan - Optional time range (e.g., "1h", "24h", "7d")
 * @returns A CLSKqlResult with column definitions and row data
 * @throws API error with ProblemDetails if the query is invalid or contains dangerous keywords
 */
export const FNexecuteKql = async (query: string, timeSpan?: string): Promise<CLSKqlResult> => {
  const { data } = await apiClient.post('/api/kql', { query, timeSpan });
  return data;
};

/**
 * Fetches all saved KQL queries from the server.
 * Returns default example queries if none have been saved yet.
 * @returns Array of CLSSavedQuery objects
 */
export const FNfetchSavedQueries = async (): Promise<CLSSavedQuery[]> => {
  const { data } = await apiClient.get('/api/kql/saved');
  return data;
};

/**
 * Saves a new KQL query with a name and optional description.
 * The server assigns a unique ID and creation timestamp.
 * @param query - Object with name, query text, and optional description
 * @returns The saved query with its assigned ID and timestamp
 */
export const FNsaveQuery = async (query: { name: string; query: string; description?: string }): Promise<CLSSavedQuery> => {
  const { data } = await apiClient.post('/api/kql/saved', query);
  return data;
};

/**
 * Deletes a saved KQL query by its unique identifier.
 * @param id - The ID of the saved query to delete
 */
export const FNdeleteSavedQuery = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/kql/saved/${id}`);
};
