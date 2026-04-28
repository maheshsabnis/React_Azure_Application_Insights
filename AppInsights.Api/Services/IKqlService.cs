using AppInsights.Api.Models;

namespace AppInsights.Api.Services;

/// <summary>
/// Defines the contract for executing raw KQL (Kusto Query Language) queries
/// against the Log Analytics Workspace, and managing saved queries.
/// Queries are validated for safety before execution (no write/delete operations).
/// </summary>
public interface CLSIKqlService
{
    /// <summary>
    /// Executes a raw KQL query against the Log Analytics Workspace and returns tabular results.
    /// The query is validated to ensure it does not contain dangerous commands (e.g., .drop, .delete).
    /// </summary>
    /// <param name="query">The KQL query string to execute.</param>
    /// <param name="timeSpan">Optional time range for the query (e.g., "1h", "24h", "7d"). Defaults to 24h.</param>
    /// <returns>A <see cref="CLSKqlResult"/> containing column definitions and row data.</returns>
    /// <exception cref="ArgumentException">Thrown when the query is empty or contains disallowed keywords.</exception>
    Task<CLSKqlResult> FNExecuteQueryAsync(string query, string? timeSpan);

    /// <summary>
    /// Retrieves all saved KQL queries from persistent storage.
    /// Returns default example queries if no saved queries file exists.
    /// </summary>
    /// <returns>A list of <see cref="CLSSavedQuery"/> objects.</returns>
    Task<List<CLSSavedQuery>> FNGetSavedQueriesAsync();

    /// <summary>
    /// Saves a new KQL query with a name and optional description.
    /// Assigns a new unique ID and sets the creation timestamp.
    /// </summary>
    /// <param name="query">The <see cref="CLSSavedQuery"/> to save (Id and CreatedAt are overwritten).</param>
    /// <returns>The saved query with its assigned ID and timestamp.</returns>
    Task<CLSSavedQuery> FNSaveQueryAsync(CLSSavedQuery query);

    /// <summary>
    /// Deletes a saved KQL query by its unique identifier.
    /// </summary>
    /// <param name="id">The unique ID of the query to delete.</param>
    /// <returns>True if the query was found and deleted; false if not found.</returns>
    Task<bool> FNDeleteSavedQueryAsync(string id);
}
