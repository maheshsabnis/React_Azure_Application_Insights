using AppInsights.Api.Models;

namespace AppInsights.Api.Services;

/// <summary>
/// Defines the contract for querying metric and performance telemetry from Azure Application Insights.
/// Covers request summaries, dependency analysis, availability test results, and custom metrics.
/// </summary>
public interface CLSIMetricsService
{
    /// <summary>
    /// Builds a comprehensive request summary for the dashboard Overview page.
    /// Executes multiple KQL queries to gather: total requests, average duration, failure rate,
    /// exception count, request volume over time, duration trends, top failing endpoints,
    /// and response code distribution.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d"). Defaults to 24h.</param>
    /// <returns>A <see cref="CLSRequestSummary"/> containing all overview statistics and chart data.</returns>
    Task<CLSRequestSummary> FNGetRequestSummaryAsync(string? timeRange);

    /// <summary>
    /// Retrieves paginated dependency call statistics aggregated by name and type.
    /// Each entry includes average duration, failure rate, and total call count.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <param name="type">Optional dependency type filter (e.g., "SQL", "HTTP").</param>
    /// <param name="pageSize">Number of dependency entries per page.</param>
    /// <param name="page">Zero-based page index.</param>
    /// <returns>A list of <see cref="CLSDependencyEntry"/> objects sorted by call count descending.</returns>
    Task<List<CLSDependencyEntry>> FNGetDependenciesAsync(string? timeRange, string? type, int pageSize, int page);

    /// <summary>
    /// Retrieves paginated availability (web test) results from the AppAvailabilityResults table.
    /// Supports filtering by test name.
    /// </summary>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <param name="testName">Optional filter to search within test names.</param>
    /// <param name="pageSize">Number of results per page.</param>
    /// <param name="page">Zero-based page index.</param>
    /// <returns>A list of <see cref="CLSAvailabilityResult"/> objects ordered by time descending.</returns>
    Task<List<CLSAvailabilityResult>> FNGetAvailabilityAsync(string? timeRange, string? testName, int pageSize, int page);

    /// <summary>
    /// Queries a specific metric from the AppMetrics table and returns time-series data.
    /// Supports configurable aggregation functions and time bucket intervals.
    /// </summary>
    /// <param name="metricName">The metric name to query (e.g., "requests/duration").</param>
    /// <param name="timeRange">Time range shorthand (e.g., "1h", "24h", "7d").</param>
    /// <param name="interval">Optional time bucket interval (e.g., "5m", "1h"). Auto-calculated if null.</param>
    /// <param name="aggregation">Aggregation function: "avg", "sum", "min", "max", or "count".</param>
    /// <returns>A <see cref="CLSMetricResult"/> containing the time-series data points.</returns>
    Task<CLSMetricResult> FNGetMetricAsync(string metricName, string? timeRange, string? interval, string? aggregation);

    /// <summary>
    /// Retrieves the list of all available metric names from the AppMetrics and AppPerformanceCounters tables.
    /// Used to populate the metric picker dropdown in the UI.
    /// </summary>
    /// <returns>A list of <see cref="CLSMetricDefinition"/> objects sorted alphabetically.</returns>
    Task<List<CLSMetricDefinition>> FNGetMetricDefinitionsAsync();
}
