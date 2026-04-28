using System.Text.Json;
using Azure.Monitor.Query;
using AppInsights.Api.Configuration;
using AppInsights.Api.Models;
using Microsoft.Extensions.Options;
using Serilog;
using Log = Serilog.Log;

namespace AppInsights.Api.Services;

/// <summary>
/// Implementation of <see cref="CLSIKqlService"/> that provides raw KQL query execution
/// against the Log Analytics Workspace, with query safety validation and saved query management.
/// Queries are validated to block dangerous operations before execution.
/// </summary>
public class CLSKqlService : CLSIKqlService
{
    /// <summary>Azure SDK client for executing KQL queries.</summary>
    private readonly LogsQueryClient _logsClient;

    /// <summary>The Log Analytics Workspace ID to query.</summary>
    private readonly string _workspaceId;

    /// <summary>File path for persisting saved queries as JSON.</summary>
    private readonly string _savedQueriesPath;

    /// <summary>
    /// KQL management commands that could modify or delete data.
    /// Any query containing these keywords will be rejected by <see cref="FNValidateQuery"/>.
    /// </summary>
    private static readonly string[] DangerousKeywords = { ".set", ".drop", ".delete", ".purge", ".replace", ".create-or-alter" };

    /// <summary>
    /// Initializes a new instance of <see cref="CLSKqlService"/>.
    /// </summary>
    /// <param name="logsClient">The Azure Monitor <see cref="LogsQueryClient"/> for executing KQL.</param>
    /// <param name="settings">Azure configuration containing the Workspace ID.</param>
    /// <param name="env">Web host environment used to determine the content root for saved queries storage.</param>
    public CLSKqlService(LogsQueryClient logsClient, IOptions<CLSAzureSettings> settings, IWebHostEnvironment env)
    {
        _logsClient = logsClient;
        _workspaceId = settings.Value.WorkspaceId;
        _savedQueriesPath = Path.Combine(env.ContentRootPath, "saved-queries.json");
    }

    /// <summary>
    /// Executes a raw KQL query against the Log Analytics Workspace after safety validation.
    /// Returns the result as a tabular structure with column definitions and row data.
    /// </summary>
    /// <param name="query">The KQL query to execute. Must be read-only (no management commands).</param>
    /// <param name="timeSpan">Optional time range (e.g., "1h", "7d"). Defaults to 24h.</param>
    /// <returns>A <see cref="CLSKqlResult"/> with columns and rows from the query.</returns>
    /// <exception cref="ArgumentException">Thrown when the query is empty or contains dangerous keywords.</exception>
    public async Task<CLSKqlResult> FNExecuteQueryAsync(string query, string? timeSpan)
    {
        FNValidateQuery(query);

        Log.Information("Executing KQL query: {Query}", query);

        var ts = string.IsNullOrWhiteSpace(timeSpan) ? TimeSpan.FromHours(24) : FNParseTimeSpan(timeSpan);
        var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, query, new QueryTimeRange(ts));

        var table = response.Value.Table;
        var result = new CLSKqlResult
        {
            Columns = table.Columns.Select(c => new CLSKqlColumn
            {
                Name = c.Name,
                Type = c.Type.ToString()
            }).ToList(),
            RowCount = table.Rows.Count
        };

        foreach (var row in table.Rows)
        {
            var rowData = new List<object?>();
            for (int i = 0; i < table.Columns.Count; i++)
            {
                rowData.Add(row[i]);
            }
            result.Rows.Add(rowData);
        }

        return result;
    }

    /// <summary>
    /// Retrieves all saved queries from the JSON file on disk.
    /// Returns a default set of example queries if no saved queries file exists.
    /// </summary>
    public async Task<List<CLSSavedQuery>> FNGetSavedQueriesAsync()
    {
        if (!File.Exists(_savedQueriesPath))
            return FNGetDefaultQueries();

        var json = await File.ReadAllTextAsync(_savedQueriesPath);
        return JsonSerializer.Deserialize<List<CLSSavedQuery>>(json) ?? new List<CLSSavedQuery>();
    }

    /// <summary>
    /// Saves a new KQL query to persistent storage with a freshly generated ID and timestamp.
    /// </summary>
    /// <param name="query">The query to save. ID and CreatedAt will be overwritten.</param>
    /// <returns>The saved query with its assigned ID and creation timestamp.</returns>
    public async Task<CLSSavedQuery> FNSaveQueryAsync(CLSSavedQuery query)
    {
        var queries = await FNGetSavedQueriesAsync();
        query.Id = Guid.NewGuid().ToString();
        query.CreatedAt = DateTimeOffset.UtcNow;
        queries.Add(query);
        await FNSaveQueriesFileAsync(queries);
        return query;
    }

    /// <summary>
    /// Deletes a saved query by its unique identifier.
    /// </summary>
    /// <param name="id">The ID of the query to remove.</param>
    /// <returns>True if the query was found and deleted; false otherwise.</returns>
    public async Task<bool> FNDeleteSavedQueryAsync(string id)
    {
        var queries = await FNGetSavedQueriesAsync();
        var removed = queries.RemoveAll(q => q.Id == id);
        if (removed > 0)
        {
            await FNSaveQueriesFileAsync(queries);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Validates that a KQL query is safe to execute. Checks for:
    /// 1) Non-empty query text
    /// 2) Absence of dangerous management commands (.set, .drop, .delete, etc.)
    /// </summary>
    /// <exception cref="ArgumentException">Thrown when validation fails.</exception>
    private static void FNValidateQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Query cannot be empty.");

        var lower = query.ToLower();
        foreach (var keyword in DangerousKeywords)
        {
            if (lower.Contains(keyword))
                throw new ArgumentException($"Query contains disallowed keyword: {keyword}");
        }
    }

    /// <summary>
    /// Persists the list of saved queries to a JSON file on disk.
    /// </summary>
    private async Task FNSaveQueriesFileAsync(List<CLSSavedQuery> queries)
    {
        var json = JsonSerializer.Serialize(queries, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(_savedQueriesPath, json);
    }

    /// <summary>
    /// Returns a default set of example KQL queries for new users.
    /// These are shown when no saved-queries.json file exists on disk.
    /// </summary>
    private static List<CLSSavedQuery> FNGetDefaultQueries() => new()
    {
        new CLSSavedQuery
        {
            Id = "default-1",
            Name = "Top Errors (Last 24h)",
            Query = "AppExceptions\n| summarize count() by ExceptionType, OuterMessage\n| order by count_ desc\n| take 10",
            Description = "Top 10 most frequent exceptions"
        },
        new CLSSavedQuery
        {
            Id = "default-2",
            Name = "Slow Requests (>2s)",
            Query = "AppRequests\n| where DurationMs > 2000\n| order by DurationMs desc\n| take 50\n| project TimeGenerated, Name, DurationMs, ResultCode, Success",
            Description = "Requests taking longer than 2 seconds"
        },
        new CLSSavedQuery
        {
            Id = "default-3",
            Name = "Failed Dependencies",
            Query = "AppDependencies\n| where Success == false\n| summarize count() by Name, DependencyType, ResultCode\n| order by count_ desc\n| take 20",
            Description = "Most failing external dependency calls"
        },
        new CLSSavedQuery
        {
            Id = "default-4",
            Name = "Request Volume by Endpoint",
            Query = "AppRequests\n| summarize requestCount = count(), avgDuration = avg(DurationMs) by Name\n| order by requestCount desc\n| take 20",
            Description = "Request count and avg duration per endpoint"
        },
        new CLSSavedQuery
        {
            Id = "default-5",
            Name = "Trace Logs with Errors",
            Query = "AppTraces\n| where SeverityLevel >= 3\n| order by TimeGenerated desc\n| take 100\n| project TimeGenerated, Message, SeverityLevel, OperationId",
            Description = "Recent error and critical trace logs"
        }
    };

    /// <summary>
    /// Parses a time range string into a <see cref="TimeSpan"/>. Defaults to 24 hours.
    /// </summary>
    private static TimeSpan FNParseTimeSpan(string timeSpan)
    {
        return timeSpan.ToLower() switch
        {
            "1h" => TimeSpan.FromHours(1),
            "6h" => TimeSpan.FromHours(6),
            "12h" => TimeSpan.FromHours(12),
            "24h" or "1d" => TimeSpan.FromDays(1),
            "7d" => TimeSpan.FromDays(7),
            "30d" => TimeSpan.FromDays(30),
            _ => TimeSpan.TryParse(timeSpan, out var ts) ? ts : TimeSpan.FromHours(24)
        };
    }
}
