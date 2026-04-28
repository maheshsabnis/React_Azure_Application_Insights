using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for the dashboard Overview page.
/// Provides an aggregated request summary combining multiple KQL queries into
/// a single response with totals, time-series, and categorical data.
/// </summary>
[Authorize]
[ApiController]
[Route("api/requests")]
public class CLSRequestsController : ControllerBase
{
    private readonly CLSIMetricsService _metricsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSRequestsController"/>.
    /// </summary>
    /// <param name="metricsService">The metrics service for building request summaries.</param>
    public CLSRequestsController(CLSIMetricsService metricsService)
    {
        _metricsService = metricsService;
    }

    /// <summary>
    /// GET /api/requests/summary?timeRange=24h
    /// Returns a comprehensive overview of request performance including:
    /// total requests, average duration, failure rate, exception count,
    /// request volume over time, duration trends, top failing endpoints,
    /// and response code distribution.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <returns>A JSON <see cref="Models.CLSRequestSummary"/> object with all overview data.</returns>
    [HttpGet("summary")]
    public async Task<IActionResult> FNGetSummary([FromQuery] string? timeRange = "24h")
    {
        var summary = await _metricsService.FNGetRequestSummaryAsync(timeRange);
        return Ok(summary);
    }
}
