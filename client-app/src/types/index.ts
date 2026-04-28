/**
 * TypeScript interfaces matching the ASP.NET Core API response DTOs.
 * Each interface maps to a corresponding C# model in AppInsights.Api/Models/.
 * These types ensure type-safe communication between the React frontend and the .NET backend.
 */

/** Represents a single application trace log entry from the AppTraces table. */
export interface CLSLogEntry {
  /** When the log message was emitted (ISO 8601 string). */
  timestamp: string;
  /** The log message text content. */
  message: string;
  /** Numeric severity: 0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical. */
  severityLevel: number;
  /** Human-readable severity name (e.g., "Error", "Warning"). */
  severityName: string;
  /** Correlation ID linking this log to other telemetry in the same distributed operation. */
  operationId?: string;
  /** The name of the operation (e.g., "GET /api/users"). */
  operationName?: string;
  /** The cloud role/service name that emitted the log. */
  appRoleName?: string;
  /** Additional key-value properties as a JSON string. */
  customDimensions?: string;
}

/** Represents a single span in a distributed trace (request or dependency call). */
export interface CLSTraceItem {
  /** When the span started executing. */
  timestamp: string;
  /** Telemetry type: "AppRequests", "AppDependencies", "AppTraces", or "AppExceptions". */
  itemType: string;
  /** The request endpoint or dependency target name. */
  name: string;
  /** Execution time in milliseconds. */
  durationMs: number;
  /** Whether the operation completed successfully. */
  success: boolean;
  /** HTTP status code or dependency result code. */
  resultCode?: string;
  /** Shared ID linking all spans in the same distributed trace. */
  operationId?: string;
  /** ID of the parent span in the trace hierarchy. */
  parentId?: string;
  /** Unique identifier for this specific span. */
  id?: string;
  /** Target of a dependency call (e.g., SQL server hostname). */
  target?: string;
  /** Type of dependency (e.g., "SQL", "HTTP"). */
  dependencyType?: string;
}

/** Represents a single exception captured by Application Insights. */
export interface CLSExceptionEntry {
  /** When the exception was thrown. */
  timestamp: string;
  /** Fully qualified exception type name (e.g., "System.NullReferenceException"). */
  exceptionType: string;
  /** The exception message text. */
  message: string;
  /** The outermost exception message (may differ in wrapped exceptions). */
  outerMessage?: string;
  /** Full stack trace for debugging. */
  stackTrace?: string;
  /** Correlation ID for the operation that caused the exception. */
  operationId?: string;
  /** The service/role where the exception was thrown. */
  appRoleName?: string;
  /** Severity level, typically 3 (Error) or 4 (Critical). */
  severityLevel: number;
}

/** Exceptions aggregated by type and message with occurrence counts. */
export interface CLSExceptionGroup {
  /** The shared exception type for all exceptions in this group. */
  exceptionType: string;
  /** The common outer message. */
  message: string;
  /** Total number of occurrences. */
  count: number;
  /** When the most recent occurrence was recorded. */
  lastSeen: string;
}

/** Describes an available metric in Application Insights. */
export interface CLSMetricDefinition {
  /** Internal metric name used in KQL queries. */
  name: string;
  /** Human-friendly display name. */
  displayName?: string;
  /** Unit of measurement (e.g., "ms", "bytes"). */
  unit?: string;
}

/** Time-series result of a metric query for chart rendering. */
export interface CLSMetricResult {
  /** The queried metric name. */
  name: string;
  /** Unit of measurement. */
  unit?: string;
  /** Aggregation function applied: "avg", "sum", "min", "max", or "count". */
  aggregation: string;
  /** Time-series data points. */
  timeseries: CLSMetricDataPoint[];
}

/** A single data point in a metric time series. */
export interface CLSMetricDataPoint {
  /** Start of the time bucket. */
  timestamp: string;
  /** Aggregated value for this bucket. Null if no data. */
  value?: number;
}

/** Aggregated request statistics for the dashboard Overview page. */
export interface CLSRequestSummary {
  /** Total HTTP requests in the time window. */
  totalRequests: number;
  /** Average response time in milliseconds. */
  avgDurationMs: number;
  /** Percentage of failed requests (0-100). */
  failureRate: number;
  /** Total exceptions thrown. */
  totalExceptions: number;
  /** Request volume over time for line chart. */
  requestsOverTime: CLSTimeSeriesPoint[];
  /** Average duration over time for line chart. */
  avgDurationOverTime: CLSTimeSeriesPoint[];
  /** Top failing endpoints for bar chart. */
  topFailingEndpoints: CLSNameValuePair[];
  /** Response code distribution for pie chart. */
  responseCodeDistribution: CLSNameValuePair[];
}

/** A single point in a time series (timestamp + value). */
export interface CLSTimeSeriesPoint {
  /** Start of the time bucket. */
  timestamp: string;
  /** Aggregated value. */
  value: number;
}

/** Simple name-value pair for categorical data (charts, lists). */
export interface CLSNameValuePair {
  /** Category name (e.g., endpoint name, response code group). */
  name: string;
  /** Numeric value (e.g., count, rate). */
  value: number;
}

/** External dependency call statistics aggregated by name and type. */
export interface CLSDependencyEntry {
  /** Dependency target name. */
  name: string;
  /** Dependency type (e.g., "SQL", "HTTP", "Redis"). */
  type: string;
  /** Average execution time in milliseconds. */
  avgDurationMs: number;
  /** Failure rate as a percentage (0-100). */
  failureRate: number;
  /** Total number of calls. */
  callCount: number;
}

/** A single availability (web test) result. */
export interface CLSAvailabilityResult {
  /** When the test was executed. */
  timestamp: string;
  /** Name of the availability test. */
  testName: string;
  /** Geographic location of the test probe. */
  location: string;
  /** Whether the test passed. */
  success: boolean;
  /** Test completion time in milliseconds. */
  durationMs: number;
  /** Diagnostic message (typically for failures). */
  message?: string;
}

/** Request payload for executing a raw KQL query. */
export interface CLSKqlQueryRequest {
  /** The KQL query string. */
  query: string;
  /** Optional time range (e.g., "1h", "24h", "7d"). */
  timeSpan?: string;
}

/** Tabular result of a KQL query execution. */
export interface CLSKqlResult {
  /** Column definitions (name and data type). */
  columns: CLSKqlColumn[];
  /** Row data as arrays of values matching columns by index. */
  rows: (string | number | boolean | null)[][];
  /** Total number of rows returned. */
  rowCount: number;
}

/** A single column in a KQL result table. */
export interface CLSKqlColumn {
  /** Column name. */
  name: string;
  /** Data type (e.g., "string", "datetime", "long"). */
  type: string;
}

/** A saved KQL query with name and description for reuse. */
export interface CLSSavedQuery {
  /** Unique identifier. */
  id: string;
  /** User-assigned query name. */
  name: string;
  /** The KQL query text. */
  query: string;
  /** Optional description of what the query does. */
  description?: string;
  /** When the query was saved (ISO 8601). */
  createdAt: string;
}
