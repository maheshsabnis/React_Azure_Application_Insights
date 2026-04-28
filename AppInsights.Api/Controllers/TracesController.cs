using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying request traces and distributed trace details
/// from Azure Application Insights. Provides paginated request listing and
/// detailed waterfall view for individual operations.
/// </summary>
[Authorize]
[ApiController]
[Route("api/traces")]
public class CLSTracesController : ControllerBase
{
    private readonly CLSILogsService _logsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSTracesController"/>.
    /// </summary>
    /// <param name="logsService">The logs service for querying trace data.</param>
    public CLSTracesController(CLSILogsService logsService)
    {
        _logsService = logsService;
    }

    /// <summary>
    /// GET /api/traces?timeRange=24h&amp;operationName=GET&amp;minDurationMs=100&amp;success=true&amp;pageSize=50&amp;page=0
    /// Retrieves paginated request traces with optional filtering by operation name, duration, and success status.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <param name="operationName">Optional filter to search within operation names.</param>
    /// <param name="minDurationMs">Optional minimum duration threshold in milliseconds.</param>
    /// <param name="success">Optional filter for successful or failed requests.</param>
    /// <param name="pageSize">Number of traces per page. Defaults to 50.</param>
    /// <param name="page">Zero-based page index. Defaults to 0.</param>
    /// <returns>A JSON array of <see cref="Models.CLSTraceItem"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetTraces(
        [FromQuery] string? timeRange = "24h",
        [FromQuery] string? operationName = null,
        [FromQuery] double? minDurationMs = null,
        [FromQuery] bool? success = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int page = 0)
    {
        var traces = await _logsService.FNGetTracesAsync(timeRange, operationName, minDurationMs, success, pageSize, page);
        return Ok(traces);
    }

    /// <summary>
    /// GET /api/traces/{operationId}
    /// Retrieves all spans (requests, dependencies, traces, exceptions) belonging to a specific
    /// distributed operation, identified by its Operation ID. Used for the trace waterfall view.
    /// </summary>
    /// <param name="operationId">The Operation ID linking all spans in the distributed trace.</param>
    /// <returns>A JSON array of <see cref="Models.CLSTraceItem"/> objects ordered chronologically.</returns>
    [HttpGet("{operationId}")]
    public async Task<IActionResult> FNGetTraceDetail(string operationId)
    {
        var trace = await _logsService.FNGetTraceByOperationIdAsync(operationId);
        return Ok(trace);
    }
}
