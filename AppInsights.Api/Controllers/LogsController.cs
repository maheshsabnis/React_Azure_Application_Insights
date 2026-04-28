using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying application trace logs from Azure Application Insights.
/// Provides paginated access to the AppTraces table with optional severity and text search filters.
/// Requires Entra ID authentication via [Authorize] attribute.
/// </summary>
[Authorize]
[ApiController]
[Route("api/logs")]
public class CLSLogsController : ControllerBase
{
    private readonly CLSILogsService _logsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSLogsController"/>.
    /// </summary>
    /// <param name="logsService">The logs service for querying Application Insights trace data.</param>
    public CLSLogsController(CLSILogsService logsService)
    {
        _logsService = logsService;
    }

    /// <summary>
    /// GET /api/logs?timeRange=24h&amp;severity=3&amp;search=error&amp;pageSize=50&amp;page=0
    /// Retrieves paginated application trace logs with optional filtering by severity level and message text.
    /// </summary>
    /// <param name="timeRange">Time range filter (e.g., "1h", "24h", "7d"). Defaults to "24h".</param>
    /// <param name="severity">Optional severity level filter (0=Verbose through 4=Critical).</param>
    /// <param name="search">Optional text to search for within log messages.</param>
    /// <param name="pageSize">Number of log entries per page. Defaults to 50.</param>
    /// <param name="page">Zero-based page index. Defaults to 0.</param>
    /// <returns>A JSON array of <see cref="Models.CLSLogEntry"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetLogs(
        [FromQuery] string? timeRange = "24h",
        [FromQuery] int? severity = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int page = 0)
    {
        var logs = await _logsService.FNGetLogsAsync(timeRange, severity, search, pageSize, page);
        return Ok(logs);
    }
}
