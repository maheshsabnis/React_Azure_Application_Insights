namespace AppInsights.Api.Configuration;

/// <summary>
/// Configuration settings for Microsoft Entra ID (formerly Azure AD) JWT bearer authentication.
/// Bound to the "AzureAd" section in appsettings.json.
/// Used by Microsoft.Identity.Web to validate incoming bearer tokens from the React SPA.
/// </summary>
public class CLSEntraIdSettings
{
    /// <summary>
    /// The configuration section name in appsettings.json that maps to this class.
    /// </summary>
    public const string SectionName = "AzureAd";

    /// <summary>
    /// The Entra ID login endpoint. Defaults to the global Azure AD endpoint.
    /// Override for sovereign clouds (e.g., Azure Government, Azure China).
    /// </summary>
    public string Instance { get; set; } = "https://login.microsoftonline.com/";

    /// <summary>
    /// The Entra ID tenant ID where users authenticate.
    /// Combined with <see cref="Instance"/> to form the authority URL.
    /// </summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>
    /// The Client ID of the API app registration in Entra ID.
    /// Tokens must be issued for this application to be accepted.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// The expected audience claim in the JWT token.
    /// Typically matches the Application ID URI (e.g., "api://appinsights-dashboard").
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// Comma-separated list of API scopes exposed by this API registration
    /// (e.g., "access_as_user"). Used for fine-grained authorization.
    /// </summary>
    public string Scopes { get; set; } = string.Empty;
}
