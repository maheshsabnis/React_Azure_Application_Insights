using Azure.Monitor.Query;
using AppInsights.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AppInsights.Api.Controllers;

/// <summary>
/// Health check controller that verifies connectivity to the Azure Log Analytics Workspace.
/// This endpoint is NOT protected by [Authorize] so it can be used by load balancers and monitoring tools.
/// </summary>
[ApiController]
[Route("api/health")]
public class CLSHealthController : ControllerBase
{
    private readonly LogsQueryClient _logsClient;
    private readonly string _workspaceId;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSHealthController"/>.
    /// </summary>
    /// <param name="logsClient">Azure SDK client used to test workspace connectivity.</param>
    /// <param name="settings">Azure configuration containing the Workspace ID.</param>
    public CLSHealthController(LogsQueryClient logsClient, IOptions<CLSAzureSettings> settings)
    {
        _logsClient = logsClient;
        _workspaceId = settings.Value.WorkspaceId;
    }

    /// <summary>
    /// GET /api/health
    /// Executes a minimal KQL query ("print 'health_check'") against the workspace to verify connectivity.
    /// Returns 200 with "healthy" status if successful, or 503 with error details if the connection fails.
    /// </summary>
    /// <returns>JSON object with status, workspace ID, and timestamp.</returns>
    [HttpGet]
    public async Task<IActionResult> FNGet()
    {
        try
        {
            var response = await _logsClient.QueryWorkspaceAsync(
                _workspaceId,
                "print 'health_check'",
                new QueryTimeRange(TimeSpan.FromMinutes(5)));

            return Ok(new { status = "healthy", workspace = _workspaceId, timestamp = DateTimeOffset.UtcNow });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "unhealthy", error = ex.Message, timestamp = DateTimeOffset.UtcNow });
        }
    }
}
