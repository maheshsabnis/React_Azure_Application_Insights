namespace AppInsights.Api.Configuration;

/// <summary>
/// Configuration settings for connecting to Azure Application Insights
/// via the Log Analytics Workspace. Bound to the "Azure" section in appsettings.json.
/// These settings are used to authenticate with Azure and identify which workspace to query.
/// </summary>
public class CLSAzureSettings
{
    /// <summary>
    /// The configuration section name in appsettings.json that maps to this class.
    /// </summary>
    public const string SectionName = "Azure";

    /// <summary>
    /// The Microsoft Entra ID (Azure AD) tenant identifier.
    /// Used to construct the authentication authority URL.
    /// </summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>
    /// The App Registration client (application) ID used for service-to-service authentication
    /// with Azure Monitor APIs via <see cref="Azure.Identity.ClientSecretCredential"/>.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// The App Registration client secret. Combined with <see cref="TenantId"/> and
    /// <see cref="ClientId"/> to create a <see cref="Azure.Identity.ClientSecretCredential"/>.
    /// Should be stored securely using User Secrets or Azure Key Vault.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// The Log Analytics Workspace ID that backs the Application Insights resource.
    /// All KQL queries are executed against this workspace using <see cref="Azure.Monitor.Query.LogsQueryClient"/>.
    /// Found in Azure Portal under Log Analytics Workspace > Properties.
    /// </summary>
    public string WorkspaceId { get; set; } = string.Empty;

    /// <summary>
    /// Optional full Azure Resource ID of the Application Insights resource.
    /// Used by <see cref="Azure.Monitor.Query.MetricsQueryClient"/> for metrics-specific queries.
    /// Format: /subscriptions/{sub}/resourceGroups/{rg}/providers/microsoft.insights/components/{name}
    /// </summary>
    public string? ResourceId { get; set; }
}
