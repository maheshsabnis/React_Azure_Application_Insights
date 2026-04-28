/**
 * Custom React Hooks for Application Insights API Queries
 *
 * Each hook wraps a TanStack Query useQuery() call that fetches data from the backend API.
 * Features provided by TanStack Query:
 * - Automatic caching with configurable stale time
 * - Background refetching when params change
 * - Loading and error state management
 * - Conditional fetching via the `enabled` option
 * - Automatic polling via `refetchInterval`
 *
 * Query keys include all parameters, so changing any filter (time range, severity, page)
 * automatically triggers a new fetch with proper cache management.
 */

import { useQuery } from '@tanstack/react-query';
import { FNfetchLogs } from '../api/logsApi';
import { FNfetchTraces, FNfetchTraceDetail } from '../api/tracesApi';
import { FNfetchExceptions, FNfetchExceptionGroups } from '../api/exceptionsApi';
import { FNfetchRequestSummary, FNfetchMetricDefinitions, FNfetchMetric, FNfetchDependencies, FNfetchAvailability } from '../api/metricsApi';
import { FNfetchSavedQueries } from '../api/kqlApi';

/** Fetches paginated logs from AppTraces. Refetches when any param changes. */
export const FNuseLogs = (params: { timeRange?: string; severity?: number; search?: string; pageSize?: number; page?: number }) =>
  useQuery({ queryKey: ['logs', params], queryFn: () => FNfetchLogs(params) });

/** Fetches paginated request traces from AppRequests. Refetches when any param changes. */
export const FNuseTraces = (params: { timeRange?: string; operationName?: string; minDurationMs?: number; success?: boolean; pageSize?: number; page?: number }) =>
  useQuery({ queryKey: ['traces', params], queryFn: () => FNfetchTraces(params) });

/** Fetches all spans for a distributed trace. Only executes when operationId is non-empty. */
export const FNuseTraceDetail = (operationId: string) =>
  useQuery({ queryKey: ['trace', operationId], queryFn: () => FNfetchTraceDetail(operationId), enabled: !!operationId });

/** Fetches paginated exceptions from AppExceptions. Refetches when any param changes. */
export const FNuseExceptions = (params: { timeRange?: string; exceptionType?: string; pageSize?: number; page?: number }) =>
  useQuery({ queryKey: ['exceptions', params], queryFn: () => FNfetchExceptions(params) });

/** Fetches exception groups (aggregated by type). Refetches when timeRange changes. */
export const FNuseExceptionGroups = (timeRange?: string) =>
  useQuery({ queryKey: ['exceptionGroups', timeRange], queryFn: () => FNfetchExceptionGroups(timeRange) });

/** Fetches the overview request summary. Auto-refreshes every 30 seconds for near-real-time data. */
export const FNuseRequestSummary = (timeRange?: string) =>
  useQuery({ queryKey: ['requestSummary', timeRange], queryFn: () => FNfetchRequestSummary(timeRange), refetchInterval: 30000 });

/** Fetches all available metric names for the metric picker dropdown. */
export const FNuseMetricDefinitions = () =>
  useQuery({ queryKey: ['metricDefinitions'], queryFn: FNfetchMetricDefinitions });

/** Fetches time-series data for a specific metric. Only executes when metricName is non-empty. */
export const FNuseMetric = (params: { metricName: string; timeRange?: string; interval?: string; aggregation?: string }) =>
  useQuery({ queryKey: ['metric', params], queryFn: () => FNfetchMetric(params), enabled: !!params.metricName });

/** Fetches paginated dependency statistics from AppDependencies. */
export const FNuseDependencies = (params: { timeRange?: string; type?: string; pageSize?: number; page?: number }) =>
  useQuery({ queryKey: ['dependencies', params], queryFn: () => FNfetchDependencies(params) });

/** Fetches paginated availability test results from AppAvailabilityResults. */
export const FNuseAvailability = (params: { timeRange?: string; testName?: string; pageSize?: number; page?: number }) =>
  useQuery({ queryKey: ['availability', params], queryFn: () => FNfetchAvailability(params) });

/** Fetches all saved KQL queries for the query editor sidebar. */
export const FNuseSavedQueries = () =>
  useQuery({ queryKey: ['savedQueries'], queryFn: FNfetchSavedQueries });
