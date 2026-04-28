using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying availability (web test) results from Azure Application Insights.
/// Availability tests are periodic probes that check your application's health from multiple
/// geographic locations around the world.
/// </summary>
[Authorize]
[ApiController]
[Route("api/availability")]
public class CLSAvailabilityController : ControllerBase
{
    private readonly CLSIMetricsService _metricsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSAvailabilityController"/>.
    /// </summary>
    /// <param name="metricsService">The metrics service for querying availability data.</param>
    public CLSAvailabilityController(CLSIMetricsService metricsService)
    {
        _metricsService = metricsService;
    }

    /// <summary>
    /// GET /api/availability?timeRange=24h&amp;testName=homepage&amp;pageSize=50&amp;page=0
    /// Retrieves paginated availability test results with optional filtering by test name.
    /// Each result includes timestamp, test name, location, pass/fail status, and duration.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <param name="testName">Optional filter to search within test names.</param>
    /// <param name="pageSize">Number of results per page. Defaults to 50.</param>
    /// <param name="page">Zero-based page index. Defaults to 0.</param>
    /// <returns>A JSON array of <see cref="Models.CLSAvailabilityResult"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetAvailability(
        [FromQuery] string? timeRange = "24h",
        [FromQuery] string? testName = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int page = 0)
    {
        var results = await _metricsService.FNGetAvailabilityAsync(timeRange, testName, pageSize, page);
        return Ok(results);
    }
}
