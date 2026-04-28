namespace AppInsights.Api.Models;

/// <summary>
/// Describes an available metric in Application Insights.
/// Returned by the metrics definitions endpoint so the UI can populate a metric picker dropdown.
/// </summary>
public class CLSMetricDefinition
{
    /// <summary>The internal metric name used in KQL queries (e.g., "requests/duration").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional human-friendly display name for the metric.</summary>
    public string? DisplayName { get; set; }

    /// <summary>Optional unit of measurement (e.g., "ms", "bytes", "count").</summary>
    public string? Unit { get; set; }
}

/// <summary>
/// Contains the time-series result of a metric query, including the metric name,
/// aggregation type, and data points over time. Used to render area/line charts.
/// </summary>
public class CLSMetricResult
{
    /// <summary>The name of the queried metric.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional unit of measurement for the metric values.</summary>
    public string? Unit { get; set; }

    /// <summary>The aggregation function applied: "avg", "sum", "min", "max", or "count".</summary>
    public string Aggregation { get; set; } = string.Empty;

    /// <summary>The time-series data points produced by the metric query.</summary>
    public List<CLSMetricDataPoint> Timeseries { get; set; } = new();
}

/// <summary>
/// A single data point in a metric time series, consisting of a timestamp and an aggregated value.
/// </summary>
public class CLSMetricDataPoint
{
    /// <summary>The start of the time bucket for this data point.</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The aggregated metric value for this time bucket. Null if no data exists for the period.</summary>
    public double? Value { get; set; }
}

/// <summary>
/// Aggregated request statistics for the dashboard Overview page.
/// Combines results from multiple KQL queries into a single response:
/// totals, time-series, top failures, and response code distribution.
/// </summary>
public class CLSRequestSummary
{
    /// <summary>Total number of HTTP requests received in the selected time range.</summary>
    public long TotalRequests { get; set; }

    /// <summary>Average response time across all requests, in milliseconds.</summary>
    public double AvgDurationMs { get; set; }

    /// <summary>Percentage of requests that failed (Success == false), from 0 to 100.</summary>
    public double FailureRate { get; set; }

    /// <summary>Total number of exceptions thrown in the selected time range.</summary>
    public long TotalExceptions { get; set; }

    /// <summary>Request count bucketed by time intervals, for the request volume line chart.</summary>
    public List<CLSTimeSeriesPoint> RequestsOverTime { get; set; } = new();

    /// <summary>Average response time bucketed by time intervals, for the duration trend line chart.</summary>
    public List<CLSTimeSeriesPoint> AvgDurationOverTime { get; set; } = new();

    /// <summary>Top 5 endpoints with the highest failure counts, for the bar chart.</summary>
    public List<CLSNameValuePair> TopFailingEndpoints { get; set; } = new();

    /// <summary>HTTP response code distribution grouped by category (2xx, 3xx, 4xx, 5xx), for the pie chart.</summary>
    public List<CLSNameValuePair> ResponseCodeDistribution { get; set; } = new();
}

/// <summary>
/// A single point in a time series, consisting of a timestamp and a numeric value.
/// Used for charting request volume and response time over time.
/// </summary>
public class CLSTimeSeriesPoint
{
    /// <summary>The start of the time bucket.</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The aggregated value for this time bucket.</summary>
    public double Value { get; set; }
}

/// <summary>
/// A simple name-value pair used for categorical data like top endpoints or response code distributions.
/// Suitable for bar charts and pie charts.
/// </summary>
public class CLSNameValuePair
{
    /// <summary>The category name (e.g., endpoint name, response code group "2xx").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The numeric value for this category (e.g., request count, failure count).</summary>
    public double Value { get; set; }
}

/// <summary>
/// Represents an external dependency call aggregated by name and type.
/// Includes average duration, failure rate, and total call count for dependency analysis.
/// </summary>
public class CLSDependencyEntry
{
    /// <summary>The dependency call target name (e.g., SQL server, external API URL).</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The type of dependency (e.g., "SQL", "HTTP", "Azure blob", "Redis").</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Average execution time in milliseconds across all calls to this dependency.</summary>
    public double AvgDurationMs { get; set; }

    /// <summary>Percentage of calls to this dependency that failed (0–100).</summary>
    public double FailureRate { get; set; }

    /// <summary>Total number of times this dependency was called in the time range.</summary>
    public long CallCount { get; set; }
}

/// <summary>
/// Represents a single availability (web test) result from the AppAvailabilityResults table.
/// Availability tests periodically ping your application from multiple global locations.
/// </summary>
public class CLSAvailabilityResult
{
    /// <summary>When the availability test was executed.</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The name of the availability test (configured in Azure Portal).</summary>
    public string TestName { get; set; } = string.Empty;

    /// <summary>The geographic location from which the test was run (e.g., "East US", "West Europe").</summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>Whether the availability test passed (true) or failed (false).</summary>
    public bool Success { get; set; }

    /// <summary>The time taken for the test to complete, in milliseconds.</summary>
    public double DurationMs { get; set; }

    /// <summary>Optional diagnostic message, typically populated when the test fails.</summary>
    public string? Message { get; set; }
}
