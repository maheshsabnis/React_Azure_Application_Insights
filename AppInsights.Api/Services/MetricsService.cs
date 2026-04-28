using Azure.Monitor.Query;
using AppInsights.Api.Configuration;
using AppInsights.Api.Models;
using Microsoft.Extensions.Options;

namespace AppInsights.Api.Services;

/// <summary>
/// Implementation of <see cref="CLSIMetricsService"/> that queries metric and performance telemetry
/// from Azure Application Insights using KQL. Handles request summaries, dependency analysis,
/// availability test results, and custom metric time-series data.
/// </summary>
public class CLSMetricsService : CLSIMetricsService
{
    /// <summary>Azure SDK client for executing KQL queries against Log Analytics.</summary>
    private readonly LogsQueryClient _logsClient;

    /// <summary>Azure SDK client for querying the Metrics API (used for metric definitions).</summary>
    private readonly MetricsQueryClient _metricsClient;

    /// <summary>The Log Analytics Workspace ID to query.</summary>
    private readonly string _workspaceId;

    /// <summary>Optional Application Insights resource ID for Metrics API queries.</summary>
    private readonly string? _resourceId;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSMetricsService"/>.
    /// </summary>
    /// <param name="logsClient">The Azure Monitor <see cref="LogsQueryClient"/> for KQL queries.</param>
    /// <param name="metricsClient">The Azure Monitor <see cref="MetricsQueryClient"/> for metric queries.</param>
    /// <param name="settings">Azure configuration containing Workspace ID and optional Resource ID.</param>
    public CLSMetricsService(LogsQueryClient logsClient, MetricsQueryClient metricsClient, IOptions<CLSAzureSettings> settings)
    {
        _logsClient = logsClient;
        _metricsClient = metricsClient;
        _workspaceId = settings.Value.WorkspaceId;
        _resourceId = settings.Value.ResourceId;
    }

    /// <summary>
    /// Builds a comprehensive request summary by executing six KQL queries:
    /// 1) Total requests, avg duration, failure rate
    /// 2) Total exception count
    /// 3) Request volume over time (for line chart)
    /// 4) Average duration over time (for line chart)
    /// 5) Top 5 failing endpoints (for bar chart)
    /// 6) Response code distribution by category (for pie chart)
    /// </summary>
    public async Task<CLSRequestSummary> FNGetRequestSummaryAsync(string? timeRange)
    {
        var ts = FNParseTimeSpan(timeRange);
        var summary = new CLSRequestSummary();

        // Query 1: Aggregate totals - request count, average duration, failure percentage
        var totalsQuery = "AppRequests | summarize totalRequests=count(), avgDuration=avg(DurationMs), failureRate=countif(Success==false)*100.0/count()";
        var totalsResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, totalsQuery, new QueryTimeRange(ts));
        foreach (var row in totalsResponse.Value.Table.Rows)
        {
            summary.TotalRequests = row.FNGetInt64("totalRequests") ?? 0;
            summary.AvgDurationMs = Math.Round(row.FNGetDouble("avgDuration") ?? 0, 2);
            summary.FailureRate = Math.Round(row.FNGetDouble("failureRate") ?? 0, 2);
        }

        // Query 2: Total exceptions count in the time window
        var exQuery = "AppExceptions | summarize totalExceptions=count()";
        var exResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, exQuery, new QueryTimeRange(ts));
        foreach (var row in exResponse.Value.Table.Rows)
        {
            summary.TotalExceptions = row.FNGetInt64("totalExceptions") ?? 0;
        }

        // Query 3: Request volume bucketed by dynamic time intervals
        var interval = FNGetBinInterval(ts);
        var overTimeQuery = $"AppRequests | summarize requestCount=count() by bin(TimeGenerated, {interval}) | order by TimeGenerated asc";
        var overTimeResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, overTimeQuery, new QueryTimeRange(ts));
        foreach (var row in overTimeResponse.Value.Table.Rows)
        {
            summary.RequestsOverTime.Add(new CLSTimeSeriesPoint
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                Value = row.FNGetDouble("requestCount") ?? 0
            });
        }

        // Query 4: Average response duration bucketed by time intervals
        var durationOverTimeQuery = $"AppRequests | summarize avgDuration=avg(DurationMs) by bin(TimeGenerated, {interval}) | order by TimeGenerated asc";
        var durationResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, durationOverTimeQuery, new QueryTimeRange(ts));
        foreach (var row in durationResponse.Value.Table.Rows)
        {
            summary.AvgDurationOverTime.Add(new CLSTimeSeriesPoint
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                Value = Math.Round(row.FNGetDouble("avgDuration") ?? 0, 2)
            });
        }

        // Query 5: Top 5 endpoints with the most failures
        var failQuery = "AppRequests | where Success==false | summarize failCount=count() by Name | order by failCount desc | take 5";
        var failResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, failQuery, new QueryTimeRange(ts));
        foreach (var row in failResponse.Value.Table.Rows)
        {
            summary.TopFailingEndpoints.Add(new CLSNameValuePair
            {
                Name = row.FNGetString("Name") ?? "",
                Value = row.FNGetDouble("failCount") ?? 0
            });
        }

        // Query 6: Response code distribution grouped into 2xx, 3xx, 4xx, 5xx categories
        var codeQuery = "AppRequests | extend codeGroup=case(toint(ResultCode)>=200 and toint(ResultCode)<300, '2xx', toint(ResultCode)>=300 and toint(ResultCode)<400, '3xx', toint(ResultCode)>=400 and toint(ResultCode)<500, '4xx', toint(ResultCode)>=500, '5xx', 'Other') | summarize codeCount=count() by codeGroup | order by codeGroup asc";
        var codeResponse = await _logsClient.QueryWorkspaceAsync(_workspaceId, codeQuery, new QueryTimeRange(ts));
        foreach (var row in codeResponse.Value.Table.Rows)
        {
            summary.ResponseCodeDistribution.Add(new CLSNameValuePair
            {
                Name = row.FNGetString("codeGroup") ?? "",
                Value = row.FNGetDouble("codeCount") ?? 0
            });
        }

        return summary;
    }

    /// <summary>
    /// Retrieves paginated dependency call statistics aggregated by name and type.
    /// Computes average duration, failure rate, and call count per dependency.
    /// </summary>
    public async Task<List<CLSDependencyEntry>> FNGetDependenciesAsync(string? timeRange, string? type, int pageSize, int page)
    {
        var ts = FNParseTimeSpan(timeRange);
        var typeFilter = !string.IsNullOrWhiteSpace(type) ? $"| where DependencyType == \"{FNEscapeKql(type)}\"" : "";
        var offset = page * pageSize;
        var fetchCount = offset + pageSize;

        var query = $"AppDependencies {typeFilter} | summarize avgDuration=avg(DurationMs), failureRate=countif(Success==false)*100.0/count(), callCount=count() by Name, DependencyType | order by callCount desc | take {fetchCount} | serialize rn=row_number() | where rn > {offset} | project-away rn";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        var result = new List<CLSDependencyEntry>();
        foreach (var row in response.Value.Table.Rows)
        {
            result.Add(new CLSDependencyEntry
            {
                Name = row.FNGetString("Name") ?? "",
                Type = row.FNGetString("DependencyType") ?? "",
                AvgDurationMs = Math.Round(row.FNGetDouble("avgDuration") ?? 0, 2),
                FailureRate = Math.Round(row.FNGetDouble("failureRate") ?? 0, 2),
                CallCount = row.FNGetInt64("callCount") ?? 0
            });
        }
        return result;
    }

    /// <summary>
    /// Retrieves paginated availability test results from the AppAvailabilityResults table.
    /// Supports filtering by test name.
    /// </summary>
    public async Task<List<CLSAvailabilityResult>> FNGetAvailabilityAsync(string? timeRange, string? testName, int pageSize, int page)
    {
        var ts = FNParseTimeSpan(timeRange);
        var nameFilter = !string.IsNullOrWhiteSpace(testName) ? $"| where Name contains \"{FNEscapeKql(testName)}\"" : "";
        var offset = page * pageSize;
        var fetchCount = offset + pageSize;

        var query = $"AppAvailabilityResults {nameFilter} | order by TimeGenerated desc | take {fetchCount} | serialize rn=row_number() | where rn > {offset} | project-away rn | project TimeGenerated, Name, Location, Success, DurationMs, Message";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        var result = new List<CLSAvailabilityResult>();
        foreach (var row in response.Value.Table.Rows)
        {
            result.Add(new CLSAvailabilityResult
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                TestName = row.FNGetString("Name") ?? "",
                Location = row.FNGetString("Location") ?? "",
                Success = row.FNGetBoolean("Success") ?? false,
                DurationMs = row.FNGetDouble("DurationMs") ?? 0,
                Message = row.FNGetString("Message")
            });
        }
        return result;
    }

    /// <summary>
    /// Queries a specific metric from the AppMetrics table with configurable aggregation and time bucketing.
    /// Returns time-series data suitable for rendering area/line charts.
    /// </summary>
    public async Task<CLSMetricResult> FNGetMetricAsync(string metricName, string? timeRange, string? interval, string? aggregation)
    {
        var ts = FNParseTimeSpan(timeRange);
        var agg = aggregation?.ToLower() ?? "avg";
        var binInterval = interval ?? FNGetBinInterval(ts);

        var aggFunction = agg switch
        {
            "sum" => "sum",
            "min" => "min",
            "max" => "max",
            "count" => "count",
            _ => "avg"
        };

        var query = $"AppMetrics | where Name == \"{FNEscapeKql(metricName)}\" | summarize metricValue={aggFunction}(Sum) by bin(TimeGenerated, {binInterval}) | order by TimeGenerated asc";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        var result = new CLSMetricResult
        {
            Name = metricName,
            Aggregation = agg
        };

        foreach (var row in response.Value.Table.Rows)
        {
            result.Timeseries.Add(new CLSMetricDataPoint
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                Value = row.FNGetDouble("metricValue")
            });
        }
        return result;
    }

    /// <summary>
    /// Retrieves all distinct metric names from AppMetrics and AppPerformanceCounters tables.
    /// Used to populate the metric picker dropdown in the frontend.
    /// </summary>
    public async Task<List<CLSMetricDefinition>> FNGetMetricDefinitionsAsync()
    {
        var query = "union AppMetrics, AppPerformanceCounters | summarize by Name | order by Name asc | take 100";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(TimeSpan.FromDays(1)));
        var result = new List<CLSMetricDefinition>();
        foreach (var row in response.Value.Table.Rows)
        {
            result.Add(new CLSMetricDefinition { Name = row.FNGetString("Name") ?? "" });
        }
        return result;
    }

    /// <summary>
    /// Parses a human-readable time range string into a <see cref="TimeSpan"/>.
    /// Defaults to 24 hours for unrecognized or null inputs.
    /// </summary>
    private static TimeSpan FNParseTimeSpan(string? timeRange)
    {
        if (string.IsNullOrWhiteSpace(timeRange)) return TimeSpan.FromHours(24);
        return timeRange.ToLower() switch
        {
            "30m" => TimeSpan.FromMinutes(30),
            "1h" => TimeSpan.FromHours(1),
            "6h" => TimeSpan.FromHours(6),
            "12h" => TimeSpan.FromHours(12),
            "24h" or "1d" => TimeSpan.FromDays(1),
            "7d" => TimeSpan.FromDays(7),
            "30d" => TimeSpan.FromDays(30),
            _ => TimeSpan.TryParse(timeRange, out var ts) ? ts : TimeSpan.FromHours(24)
        };
    }

    /// <summary>
    /// Determines the appropriate KQL bin() interval based on the total time span.
    /// Shorter ranges use finer granularity; longer ranges use coarser buckets to avoid excessive data points.
    /// </summary>
    private static string FNGetBinInterval(TimeSpan ts)
    {
        if (ts.TotalMinutes <= 30) return "1m";
        if (ts.TotalHours <= 1) return "1m";
        if (ts.TotalHours <= 6) return "5m";
        if (ts.TotalHours <= 24) return "15m";
        if (ts.TotalDays <= 7) return "1h";
        return "6h";
    }

    /// <summary>
    /// Escapes special characters in user input to prevent KQL injection.
    /// </summary>
    private static string FNEscapeKql(string input) => input.Replace("\"", "\\\"").Replace("'", "\\'");
}
