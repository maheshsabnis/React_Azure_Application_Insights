using AppInsights.Api.Models;

namespace AppInsights.Api.Services;

/// <summary>
/// Defines the contract for querying log-based telemetry from Azure Application Insights.
/// Covers data from the AppTraces, AppRequests, and AppExceptions tables in Log Analytics.
/// </summary>
public interface CLSILogsService
{
    /// <summary>
    /// Retrieves paginated application trace log entries from the AppTraces table.
    /// Supports filtering by severity level and free-text search within messages.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d"). Defaults to 24h.</param>
    /// <param name="severity">Optional severity level filter (0=Verbose through 4=Critical).</param>
    /// <param name="search">Optional text to search for within log messages.</param>
    /// <param name="pageSize">Number of log entries per page.</param>
    /// <param name="page">Zero-based page index.</param>
    /// <returns>A list of <see cref="CLSLogEntry"/> objects for the requested page.</returns>
    Task<List<CLSLogEntry>> FNGetLogsAsync(string? timeRange, int? severity, string? search, int pageSize, int page);

    /// <summary>
    /// Retrieves paginated request traces from the AppRequests table.
    /// Supports filtering by operation name, minimum duration, and success status.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <param name="operationName">Optional filter to search within operation names.</param>
    /// <param name="minDurationMs">Optional minimum duration threshold in milliseconds.</param>
    /// <param name="success">Optional filter for successful (true) or failed (false) requests.</param>
    /// <param name="pageSize">Number of trace items per page.</param>
    /// <param name="page">Zero-based page index.</param>
    /// <returns>A list of <see cref="CLSTraceItem"/> objects for the requested page.</returns>
    Task<List<CLSTraceItem>> FNGetTracesAsync(string? timeRange, string? operationName, double? minDurationMs, bool? success, int pageSize, int page);

    /// <summary>
    /// Retrieves all spans belonging to a specific distributed trace, identified by Operation ID.
    /// Queries across AppRequests, AppDependencies, AppTraces, and AppExceptions tables using a union.
    /// Used for the trace waterfall visualization in the UI.
    /// </summary>
    /// <param name="operationId">The Operation ID that links all spans in the distributed trace.</param>
    /// <returns>A list of <see cref="CLSTraceItem"/> objects ordered chronologically within the trace.</returns>
    Task<List<CLSTraceItem>> FNGetTraceByOperationIdAsync(string operationId);

    /// <summary>
    /// Retrieves paginated exception entries from the AppExceptions table.
    /// Supports filtering by exception type name.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <param name="exceptionType">Optional filter to search within exception type names.</param>
    /// <param name="pageSize">Number of exception entries per page.</param>
    /// <param name="page">Zero-based page index.</param>
    /// <returns>A list of <see cref="CLSExceptionEntry"/> objects for the requested page.</returns>
    Task<List<CLSExceptionEntry>> FNGetExceptionsAsync(string? timeRange, string? exceptionType, int pageSize, int page);

    /// <summary>
    /// Retrieves exceptions grouped (aggregated) by type and message, with occurrence counts.
    /// Returns the top 50 exception groups sorted by frequency. Used for the "Grouped by Type" tab.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <returns>A list of <see cref="CLSExceptionGroup"/> objects sorted by count descending.</returns>
    Task<List<CLSExceptionGroup>> FNGetExceptionGroupsAsync(string? timeRange);
}
