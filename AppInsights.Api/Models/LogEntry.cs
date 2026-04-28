namespace AppInsights.Api.Models;

/// <summary>
/// Represents a single application trace log entry from the AppTraces table
/// in Azure Application Insights. Maps to diagnostic log messages emitted
/// via ILogger, Serilog, or other logging frameworks.
/// </summary>
public class CLSLogEntry
{
    /// <summary>When the log message was emitted (TimeGenerated in KQL).</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The log message text content.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Numeric severity level: 0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical.
    /// Maps to the SeverityLevel column in the AppTraces table.
    /// </summary>
    public int SeverityLevel { get; set; }

    /// <summary>Human-readable severity name (e.g., "Error", "Warning"). Computed from <see cref="SeverityLevel"/>.</summary>
    public string SeverityName { get; set; } = string.Empty;

    /// <summary>
    /// Unique identifier that correlates this log with other telemetry items
    /// (requests, dependencies, exceptions) belonging to the same distributed operation.
    /// </summary>
    public string? OperationId { get; set; }

    /// <summary>The name of the operation that generated this log (e.g., "GET /api/users").</summary>
    public string? OperationName { get; set; }

    /// <summary>The cloud role name (service name) that emitted this log. Useful in microservice architectures.</summary>
    public string? AppRoleName { get; set; }

    /// <summary>Additional key-value properties attached to the log entry, serialized as a JSON string.</summary>
    public string? CustomDimensions { get; set; }
}

/// <summary>
/// Represents a single span in a distributed trace, which can be either an HTTP request
/// (from AppRequests) or a dependency call (from AppDependencies). Used for trace waterfall views.
/// </summary>
public class CLSTraceItem
{
    /// <summary>When the span started executing.</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The telemetry item type: "AppRequests", "AppDependencies", "AppTraces", or "AppExceptions".</summary>
    public string ItemType { get; set; } = string.Empty;

    /// <summary>The name of the request endpoint or dependency target (e.g., "GET /api/orders").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The execution time in milliseconds. Key metric for identifying slow operations.</summary>
    public double DurationMs { get; set; }

    /// <summary>Whether the operation completed successfully (HTTP 2xx for requests).</summary>
    public bool Success { get; set; }

    /// <summary>The HTTP status code for requests, or result code for dependency calls.</summary>
    public string? ResultCode { get; set; }

    /// <summary>Links this span to its parent distributed trace. Shared across all spans in the same operation.</summary>
    public string? OperationId { get; set; }

    /// <summary>The ID of the parent span in the trace hierarchy.</summary>
    public string? ParentId { get; set; }

    /// <summary>Unique identifier for this specific span within the trace.</summary>
    public string? Id { get; set; }

    /// <summary>The target of a dependency call (e.g., SQL server hostname, external API URL).</summary>
    public string? Target { get; set; }

    /// <summary>The type of dependency (e.g., "SQL", "HTTP", "Azure blob", "Redis").</summary>
    public string? DependencyType { get; set; }
}

/// <summary>
/// Represents a single exception captured by Application Insights from the AppExceptions table.
/// Includes exception details, stack trace, and correlation information.
/// </summary>
public class CLSExceptionEntry
{
    /// <summary>When the exception was thrown.</summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>The fully qualified type name of the exception (e.g., "System.NullReferenceException").</summary>
    public string ExceptionType { get; set; } = string.Empty;

    /// <summary>The exception message text.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>The outermost exception message (may differ from inner exception message in wrapped exceptions).</summary>
    public string? OuterMessage { get; set; }

    /// <summary>The full stack trace of the exception, useful for debugging.</summary>
    public string? StackTrace { get; set; }

    /// <summary>Correlates the exception with the request/operation that caused it.</summary>
    public string? OperationId { get; set; }

    /// <summary>The cloud role name (service) where the exception was thrown.</summary>
    public string? AppRoleName { get; set; }

    /// <summary>Severity level of the exception: typically 3 (Error) or 4 (Critical).</summary>
    public int SeverityLevel { get; set; }
}

/// <summary>
/// Represents a group of exceptions aggregated by type and message.
/// Used for the "Grouped by Type" view to identify the most frequent exceptions.
/// </summary>
public class CLSExceptionGroup
{
    /// <summary>The fully qualified exception type name shared by all exceptions in this group.</summary>
    public string ExceptionType { get; set; } = string.Empty;

    /// <summary>The common outer message for exceptions in this group.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Total number of times this exception occurred in the selected time range.</summary>
    public long Count { get; set; }

    /// <summary>When the most recent occurrence of this exception was recorded.</summary>
    public DateTimeOffset LastSeen { get; set; }
}
