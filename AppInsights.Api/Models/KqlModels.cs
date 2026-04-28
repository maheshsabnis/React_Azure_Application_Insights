namespace AppInsights.Api.Models;

/// <summary>
/// Request payload for executing a raw KQL (Kusto Query Language) query
/// against the Log Analytics Workspace via the POST /api/kql endpoint.
/// </summary>
public class CLSKqlQueryRequest
{
    /// <summary>The KQL query string to execute (e.g., "AppRequests | take 10").</summary>
    public string Query { get; set; } = string.Empty;

    /// <summary>
    /// Optional time range for the query (e.g., "1h", "24h", "7d").
    /// Defaults to 24 hours if not specified. Limits the data scanned by the query engine.
    /// </summary>
    public string? TimeSpan { get; set; }
}

/// <summary>
/// The result of a KQL query execution, returned in a tabular format.
/// Contains column definitions (schema) and row data, suitable for rendering in a dynamic table.
/// </summary>
public class CLSKqlResult
{
    /// <summary>The column definitions (name and data type) for the result table.</summary>
    public List<CLSKqlColumn> Columns { get; set; } = new();

    /// <summary>The row data as a list of arrays. Each inner list corresponds to one row, with values matching <see cref="Columns"/> by index.</summary>
    public List<List<object?>> Rows { get; set; } = new();

    /// <summary>The total number of rows returned by the query.</summary>
    public int RowCount { get; set; }
}

/// <summary>
/// Describes a single column in a KQL query result, including its name and data type.
/// </summary>
public class CLSKqlColumn
{
    /// <summary>The column name as returned by the KQL query.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The data type of the column (e.g., "string", "datetime", "long", "real", "bool").</summary>
    public string Type { get; set; } = string.Empty;
}

/// <summary>
/// Represents a saved KQL query that users can name, describe, and reuse.
/// Persisted to a local JSON file on the server.
/// </summary>
public class CLSSavedQuery
{
    /// <summary>Unique identifier for the saved query, auto-generated as a GUID.</summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>User-assigned name for the query (e.g., "Top Errors (Last 24h)").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The KQL query text.</summary>
    public string Query { get; set; } = string.Empty;

    /// <summary>Optional description explaining what the query does.</summary>
    public string? Description { get; set; }

    /// <summary>When the query was saved, in UTC.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Represents a paged query request with optional time range, search text, and pagination parameters.
/// Used by endpoints that support server-side pagination.
/// </summary>
public class CLSQueryPagedRequest
{
    /// <summary>Optional time range filter (e.g., "24h", "7d").</summary>
    public string? TimeRange { get; set; }

    /// <summary>Number of items to return per page. Defaults to 50.</summary>
    public int PageSize { get; set; } = 50;

    /// <summary>Zero-based page index for pagination.</summary>
    public int Page { get; set; } = 0;

    /// <summary>Optional search text to filter results.</summary>
    public string? Search { get; set; }
}
