using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying external dependency call statistics
/// from Azure Application Insights. Dependencies include SQL databases,
/// HTTP APIs, Azure Storage, Redis, and other external services your app calls.
/// </summary>
[Authorize]
[ApiController]
[Route("api/dependencies")]
public class CLSDependenciesController : ControllerBase
{
    private readonly CLSIMetricsService _metricsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSDependenciesController"/>.
    /// </summary>
    /// <param name="metricsService">The metrics service for querying dependency data.</param>
    public CLSDependenciesController(CLSIMetricsService metricsService)
    {
        _metricsService = metricsService;
    }

    /// <summary>
    /// GET /api/dependencies?timeRange=24h&amp;type=SQL&amp;pageSize=50&amp;page=0
    /// Retrieves paginated dependency call statistics aggregated by name and type.
    /// Each entry includes average duration, failure rate, and total call count.
    /// </summary>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <param name="type">Optional dependency type filter (e.g., "SQL", "HTTP").</param>
    /// <param name="pageSize">Number of entries per page. Defaults to 50.</param>
    /// <param name="page">Zero-based page index. Defaults to 0.</param>
    /// <returns>A JSON array of <see cref="Models.CLSDependencyEntry"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetDependencies(
        [FromQuery] string? timeRange = "24h",
        [FromQuery] string? type = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int page = 0)
    {
        var deps = await _metricsService.FNGetDependenciesAsync(timeRange, type, pageSize, page);
        return Ok(deps);
    }
}
