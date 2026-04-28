using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for querying metric data from Azure Application Insights.
/// Provides metric definitions listing and time-series data for individual metrics
/// with configurable aggregation and time bucketing.
/// </summary>
[Authorize]
[ApiController]
[Route("api/metrics")]
public class CLSMetricsController : ControllerBase
{
    private readonly CLSIMetricsService _metricsService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSMetricsController"/>.
    /// </summary>
    /// <param name="metricsService">The metrics service for querying Application Insights metrics.</param>
    public CLSMetricsController(CLSIMetricsService metricsService)
    {
        _metricsService = metricsService;
    }

    /// <summary>
    /// GET /api/metrics
    /// Retrieves all available metric names from the AppMetrics and AppPerformanceCounters tables.
    /// Used to populate the metric picker dropdown in the frontend.
    /// </summary>
    /// <returns>A JSON array of <see cref="Models.CLSMetricDefinition"/> objects.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGetMetricDefinitions()
    {
        var definitions = await _metricsService.FNGetMetricDefinitionsAsync();
        return Ok(definitions);
    }

    /// <summary>
    /// GET /api/metrics/{metricName}?timeRange=24h&amp;interval=5m&amp;aggregation=avg
    /// Retrieves time-series data for a specific metric with configurable aggregation and interval.
    /// </summary>
    /// <param name="metricName">The metric name to query (URL-encoded if it contains special characters).</param>
    /// <param name="timeRange">Time range filter. Defaults to "24h".</param>
    /// <param name="interval">Optional time bucket interval (e.g., "5m", "1h"). Auto-calculated if null.</param>
    /// <param name="aggregation">Aggregation function: "avg", "sum", "min", "max", or "count". Defaults to "avg".</param>
    /// <returns>A JSON <see cref="Models.CLSMetricResult"/> object with time-series data points.</returns>
    [HttpGet("{metricName}")]
    public async Task<IActionResult> FNGetMetric(
        string metricName,
        [FromQuery] string? timeRange = "24h",
        [FromQuery] string? interval = null,
        [FromQuery] string? aggregation = "avg")
    {
        var metric = await _metricsService.FNGetMetricAsync(metricName, timeRange, interval, aggregation);
        return Ok(metric);
    }
}
