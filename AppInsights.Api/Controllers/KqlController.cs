using AppInsights.Api.Models;
using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppInsights.Api.Controllers;

/// <summary>
/// REST API controller for executing raw KQL (Kusto Query Language) queries
/// and managing saved queries. Provides an interactive query editor experience
/// backed by the Log Analytics Workspace.
/// </summary>
[Authorize]
[ApiController]
[Route("api/kql")]
public class CLSKqlController : ControllerBase
{
    private readonly CLSIKqlService _kqlService;

    /// <summary>
    /// Initializes a new instance of <see cref="CLSKqlController"/>.
    /// </summary>
    /// <param name="kqlService">The KQL service for query execution and saved query management.</param>
    public CLSKqlController(CLSIKqlService kqlService)
    {
        _kqlService = kqlService;
    }

    /// <summary>
    /// POST /api/kql
    /// Executes a raw KQL query against the Log Analytics Workspace.
    /// The query is validated for safety (no write/delete commands) before execution.
    /// Returns tabular results with column definitions and row data.
    /// </summary>
    /// <param name="request">The query request containing the KQL string and optional time span.</param>
    /// <returns>A <see cref="CLSKqlResult"/> on success, or a ProblemDetails 400 response for invalid queries.</returns>
    [HttpPost]
    public async Task<IActionResult> FNExecuteQuery([FromBody] CLSKqlQueryRequest request)
    {
        try
        {
            var result = await _kqlService.FNExecuteQueryAsync(request.Query, request.TimeSpan);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Query",
                Detail = ex.Message,
                Status = 400
            });
        }
    }

    /// <summary>
    /// GET /api/kql/saved
    /// Retrieves all saved KQL queries. Returns default example queries if none have been saved yet.
    /// </summary>
    /// <returns>A JSON array of <see cref="CLSSavedQuery"/> objects.</returns>
    [HttpGet("saved")]
    public async Task<IActionResult> FNGetSavedQueries()
    {
        var queries = await _kqlService.FNGetSavedQueriesAsync();
        return Ok(queries);
    }

    /// <summary>
    /// POST /api/kql/saved
    /// Saves a new KQL query with a name and optional description.
    /// Returns the saved query with its assigned ID and creation timestamp.
    /// </summary>
    /// <param name="query">The query to save (name, query text, and optional description).</param>
    /// <returns>201 Created with the saved <see cref="CLSSavedQuery"/> object.</returns>
    [HttpPost("saved")]
    public async Task<IActionResult> SaveQuery([FromBody] CLSSavedQuery query)
    {
        var saved = await _kqlService.FNSaveQueryAsync(query);
        return CreatedAtAction(nameof(FNGetSavedQueries), saved);
    }

    /// <summary>
    /// DELETE /api/kql/saved/{id}
    /// Deletes a saved KQL query by its unique identifier.
    /// </summary>
    /// <param name="id">The unique ID of the query to delete.</param>
    /// <returns>204 No Content if deleted, or 404 Not Found if the query doesn't exist.</returns>
    [HttpDelete("saved/{id}")]
    public async Task<IActionResult> FNDeleteSavedQuery(string id)
    {
        var deleted = await _kqlService.FNDeleteSavedQueryAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
