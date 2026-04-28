using Azure;
using Azure.Monitor.Query;
using Azure.Monitor.Query.Models;
using AppInsights.Api.Configuration;
using AppInsights.Api.Models;
using Microsoft.Extensions.Options;

namespace AppInsights.Api.Services;

/// <summary>
/// Implementation of <see cref="CLSILogsService"/> that queries log-based telemetry
/// from Azure Application Insights using the <see cref="LogsQueryClient"/> and KQL.
/// Handles AppTraces, AppRequests, and AppExceptions tables.
/// </summary>
public class CLSLogsService : CLSILogsService
{
    /// <summary>Azure SDK client for executing KQL queries against Log Analytics.</summary>
    private readonly LogsQueryClient _logsClient;

    /// <summary>The Log Analytics Workspace ID to query.</summary>
    private readonly string _workspaceId;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSLogsService"/> with the required Azure SDK client and settings.
    /// </summary>
    /// <param name="logsClient">The Azure Monitor <see cref="LogsQueryClient"/> for executing KQL queries.</param>
    /// <param name="settings">Azure configuration containing the Workspace ID.</param>
    public CLSLogsService(LogsQueryClient logsClient, IOptions<CLSAzureSettings> settings)
    {
        _logsClient = logsClient;
        _workspaceId = settings.Value.WorkspaceId;
    }

    /// <summary>
    /// Retrieves paginated log entries from the AppTraces table.
    /// Dynamically builds KQL filter clauses for severity and message search.
    /// Uses the row_number() pattern for server-side pagination.
    /// </summary>
    public async Task<List<CLSLogEntry>> FNGetLogsAsync(string? timeRange, int? severity, string? search, int pageSize, int page)
    {
        var ts = FNParseTimeSpan(timeRange);
        var filters = new List<string>();

        if (severity.HasValue)
            filters.Add($"| where SeverityLevel == {severity.Value}");
        if (!string.IsNullOrWhiteSpace(search))
            filters.Add($"| where Message contains \"{FNEscapeKql(search)}\"");

        var filterClause = string.Join(" ", filters);
        var offset = page * pageSize;
        var fetchCount = offset + pageSize;

        var query = $"AppTraces {filterClause} | order by TimeGenerated desc | take {fetchCount} | serialize rn=row_number() | where rn > {offset} | project-away rn | project TimeGenerated, Message, SeverityLevel, OperationId, OperationName, AppRoleName, Properties";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        return FNMapToLogEntries(response.Value);
    }

    /// <summary>
    /// Retrieves paginated request traces from the AppRequests table.
    /// Supports filtering by operation name, minimum duration, and success/failure status.
    /// </summary>
    public async Task<List<CLSTraceItem>> FNGetTracesAsync(string? timeRange, string? operationName, double? minDurationMs, bool? success, int pageSize, int page)
    {
        var ts = FNParseTimeSpan(timeRange);
        var filters = new List<string>();

        if (!string.IsNullOrWhiteSpace(operationName))
            filters.Add($"| where OperationName contains \"{FNEscapeKql(operationName)}\"");
        if (minDurationMs.HasValue)
            filters.Add($"| where DurationMs > {minDurationMs.Value}");
        if (success.HasValue)
            filters.Add($"| where Success == {success.Value.ToString().ToLower()}");

        var filterClause = string.Join(" ", filters);
        var offset = page * pageSize;
        var fetchCount = offset + pageSize;

        var query = $"AppRequests {filterClause} | order by TimeGenerated desc | take {fetchCount} | serialize rn=row_number() | where rn > {offset} | project-away rn | project TimeGenerated, Type, Name, DurationMs, Success, ResultCode, OperationId, ParentId, Id";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        return FNMapToTraceItems(response.Value);
    }

    /// <summary>
    /// Retrieves all spans for a specific distributed trace by Operation ID.
    /// Unions across AppRequests, AppDependencies, AppTraces, and AppExceptions tables
    /// to build a complete end-to-end trace waterfall view.
    /// </summary>
    /// <param name="operationId">The shared Operation ID for the distributed trace.</param>
    public async Task<List<CLSTraceItem>> FNGetTraceByOperationIdAsync(string operationId)
    {
        var query = $"union AppRequests, AppDependencies, AppTraces, AppExceptions | where OperationId == \"{FNEscapeKql(operationId)}\" | order by TimeGenerated asc | take 200 | project TimeGenerated, Type, Name, DurationMs, Success, ResultCode, OperationId, ParentId, Id, Target, DependencyType=Type";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(TimeSpan.FromDays(7)));
        return FNMapToTraceItemsFull(response.Value);
    }

    /// <summary>
    /// Retrieves paginated exception entries from the AppExceptions table.
    /// Supports filtering by exception type name.
    /// </summary>
    public async Task<List<CLSExceptionEntry>> FNGetExceptionsAsync(string? timeRange, string? exceptionType, int pageSize, int page)
    {
        var ts = FNParseTimeSpan(timeRange);
        var filters = new List<string>();

        if (!string.IsNullOrWhiteSpace(exceptionType))
            filters.Add($"| where ExceptionType contains \"{FNEscapeKql(exceptionType)}\"");

        var filterClause = string.Join(" ", filters);
        var offset = page * pageSize;
        var fetchCount = offset + pageSize;

        var query = $"AppExceptions {filterClause} | order by TimeGenerated desc | take {fetchCount} | serialize rn=row_number() | where rn > {offset} | project-away rn | project TimeGenerated, ExceptionType, OuterMessage, Details, OperationId, AppRoleName, SeverityLevel";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        return FNMapToExceptions(response.Value);
    }

    /// <summary>
    /// Groups exceptions by type and outer message, returning the top 50 most frequent.
    /// Each group includes a count and the timestamp of the most recent occurrence.
    /// </summary>
    public async Task<List<CLSExceptionGroup>> FNGetExceptionGroupsAsync(string? timeRange)
    {
        var ts = FNParseTimeSpan(timeRange);
        var query = "AppExceptions | summarize count_=count(), lastSeen=max(TimeGenerated) by ExceptionType, OuterMessage | order by count_ desc | take 50";

        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));
        var result = new List<CLSExceptionGroup>();
        foreach (var row in response.Value.Table.Rows)
        {
            result.Add(new CLSExceptionGroup
            {
                ExceptionType = row.FNGetString("ExceptionType") ?? "",
                Message = row.FNGetString("OuterMessage") ?? "",
                Count = row.FNGetInt64("count_") ?? 0,
                LastSeen = row.FNGetDateTimeOffset("lastSeen") ?? DateTimeOffset.MinValue
            });
        }
        return result;
    }

    /// <summary>
    /// Parses a human-readable time range string (e.g., "30m", "24h", "7d") into a <see cref="TimeSpan"/>.
    /// Falls back to 24 hours if the input is null, empty, or unrecognized.
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
    /// Escapes special characters in user input to prevent KQL injection attacks.
    /// </summary>
    private static string FNEscapeKql(string input) => input.Replace("\"", "\\\"").Replace("'", "\\'");

    /// <summary>
    /// Maps a KQL query result to a list of <see cref="CLSLogEntry"/> DTOs.
    /// Extracts columns: TimeGenerated, Message, SeverityLevel, OperationId, OperationName, AppRoleName, Properties.
    /// </summary>
    private static List<CLSLogEntry> FNMapToLogEntries(LogsQueryResult result)
    {
        var entries = new List<CLSLogEntry>();
        foreach (var row in result.Table.Rows)
        {
            entries.Add(new CLSLogEntry
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                Message = row.FNGetString("Message") ?? "",
                SeverityLevel = (int)(row.FNGetInt64("SeverityLevel") ?? 0),
                SeverityName = FNSeverityToName((int)(row.FNGetInt64("SeverityLevel") ?? 0)),
                OperationId = row.FNGetString("OperationId"),
                OperationName = row.FNGetString("OperationName"),
                AppRoleName = row.FNGetString("AppRoleName"),
                CustomDimensions = row.FNGetString("Properties")
            });
        }
        return entries;
    }

    /// <summary>
    /// Maps a KQL query result to a list of <see cref="CLSTraceItem"/> DTOs (basic fields only).
    /// Used for the traces list view.
    /// </summary>
    private static List<CLSTraceItem> FNMapToTraceItems(LogsQueryResult result)
    {
        var items = new List<CLSTraceItem>();
        foreach (var row in result.Table.Rows)
        {
            items.Add(new CLSTraceItem
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                ItemType = row.FNGetString("Type") ?? "AppRequests",
                Name = row.FNGetString("Name") ?? "",
                DurationMs = row.FNGetDouble("DurationMs") ?? 0,
                Success = row.FNGetBoolean("Success") ?? false,
                ResultCode = row.FNGetString("ResultCode"),
                OperationId = row.FNGetString("OperationId"),
                ParentId = row.FNGetString("ParentId"),
                Id = row.FNGetString("Id")
            });
        }
        return items;
    }

    /// <summary>
    /// Maps a KQL query result to a list of <see cref="CLSTraceItem"/> DTOs with all fields
    /// including Target and DependencyType. Used for the detailed trace waterfall view.
    /// </summary>
    private static List<CLSTraceItem> FNMapToTraceItemsFull(LogsQueryResult result)
    {
        var items = new List<CLSTraceItem>();
        foreach (var row in result.Table.Rows)
        {
            items.Add(new CLSTraceItem
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                ItemType = row.FNGetString("Type") ?? "",
                Name = row.FNGetString("Name") ?? "",
                DurationMs = row.FNGetDouble("DurationMs") ?? 0,
                Success = row.FNGetBoolean("Success") ?? false,
                ResultCode = row.FNGetString("ResultCode"),
                OperationId = row.FNGetString("OperationId"),
                ParentId = row.FNGetString("ParentId"),
                Id = row.FNGetString("Id"),
                Target = row.FNGetString("Target"),
                DependencyType = row.FNGetString("DependencyType")
            });
        }
        return items;
    }

    /// <summary>
    /// Maps a KQL query result to a list of <see cref="CLSExceptionEntry"/> DTOs.
    /// </summary>
    private static List<CLSExceptionEntry> FNMapToExceptions(LogsQueryResult result)
    {
        var entries = new List<CLSExceptionEntry>();
        foreach (var row in result.Table.Rows)
        {
            entries.Add(new CLSExceptionEntry
            {
                Timestamp = row.FNGetDateTimeOffset("TimeGenerated") ?? DateTimeOffset.MinValue,
                ExceptionType = row.FNGetString("ExceptionType") ?? "",
                OuterMessage = row.FNGetString("OuterMessage"),
                StackTrace = row.FNGetString("Details"),
                OperationId = row.FNGetString("OperationId"),
                AppRoleName = row.FNGetString("AppRoleName"),
                SeverityLevel = (int)(row.FNGetInt64("SeverityLevel") ?? 0)
            });
        }
        return entries;
    }

    /// <summary>
    /// Converts a numeric severity level to its human-readable name.
    /// Application Insights uses: 0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical.
    /// </summary>
    private static string FNSeverityToName(int level) => level switch
    {
        0 => "Verbose",
        1 => "Information",
        2 => "Warning",
        3 => "Error",
        4 => "Critical",
        _ => "Unknown"
    };
}

/// <summary>
/// Extension methods for safely extracting typed values from <see cref="LogsTableRow"/>.
/// Each method handles missing columns and type conversion errors gracefully by returning null.
/// </summary>
internal static class CLSLogsTableRowExtensions
{
    /// <summary>Safely extracts a string value from the specified column, returning null on failure.</summary>
    public static string? FNGetString(this LogsTableRow row, string column)
    {
        try { return row[column]?.ToString(); }
        catch { return null; }
    }

    /// <summary>Safely extracts a long (Int64) value from the specified column, returning null on failure.</summary>
    public static long? FNGetInt64(this LogsTableRow row, string column)
    {
        try { var val = row[column]; return val == null ? null : Convert.ToInt64(val); }
        catch { return null; }
    }

    /// <summary>Safely extracts a double value from the specified column, returning null on failure.</summary>
    public static double? FNGetDouble(this LogsTableRow row, string column)
    {
        try { var val = row[column]; return val == null ? null : Convert.ToDouble(val); }
        catch { return null; }
    }

    /// <summary>Safely extracts a boolean value from the specified column, returning null on failure.</summary>
    public static bool? FNGetBoolean(this LogsTableRow row, string column)
    {
        try { var val = row[column]; return val == null ? null : Convert.ToBoolean(val); }
        catch { return null; }
    }

    /// <summary>
    /// Safely extracts a DateTimeOffset value from the specified column.
    /// Handles both <see cref="DateTimeOffset"/> and <see cref="DateTime"/> raw types,
    /// and falls back to string parsing. Returns null on failure.
    /// </summary>
    public static DateTimeOffset? FNGetDateTimeOffset(this LogsTableRow row, string column)
    {
        try
        {
            var val = row[column];
            if (val is DateTimeOffset dto) return dto;
            if (val is DateTime dt) return new DateTimeOffset(dt, TimeSpan.Zero);
            return val == null ? null : DateTimeOffset.Parse(val.ToString()!);
        }
        catch { return null; }
    }
}
