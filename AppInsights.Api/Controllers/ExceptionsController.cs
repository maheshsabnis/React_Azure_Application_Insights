using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying exception telemetry from Azure Application Insights.
/// Provides both individual exception listing and grouped exception summaries.
/// </summary>
[Authorize]
[ApiController]
[Route("api/exceptions")]
public class CLSExceptionsController : ControllerBase
{
    private readonly CLSILogsService _logsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSExceptionsController"/>.
    /// </summary>
    /// <param name="logsService">The logs service for querying exception data.</param>
    public CLSExceptionsController(CLSILogsService logsService)
    {
        _logsService = logsService;
    }

    /// <summary>
    /// GET /api/exceptions?timeRange=24h&amp;exceptionType=NullReference&amp;pageSize=50&amp;page=0
    /// Retrieves paginated exception entries with optional filtering by exception type.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <param name="exceptionType">Optional filter to search within exception type names.</param>
    /// <param name="pageSize">Number of exceptions per page. Defaults to 50.</param>
    /// <param name="page">Zero-based page index. Defaults to 0.</param>
    /// <returns>A JSON array of <see cref="Models.CLSExceptionEntry"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetExceptions(
        [FromQuery] string? timeRange = "24h",
        [FromQuery] string? exceptionType = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int page = 0)
    {
        var exceptions = await _logsService.FNGetExceptionsAsync(timeRange, exceptionType, pageSize, page);
        return Ok(exceptions);
    }

    /// <summary>
    /// GET /api/exceptions/groups?timeRange=24h
    /// Retrieves exceptions aggregated (grouped) by type and message, with counts and last-seen timestamps.
    /// Returns the top 50 groups sorted by frequency. Used for the "Grouped by Type" tab in the UI.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <returns>A JSON array of <see cref="Models.CLSExceptionGroup"/> objects.</returns>
    [HttpGet("groups")]
    public async Task<IActionResult> FNGetExceptionGroups([FromQuery] string? timeRange = "24h")
    {
        var groups = await _logsService.FNGetExceptionGroupsAsync(timeRange);
        return Ok(groups);
    }
}
