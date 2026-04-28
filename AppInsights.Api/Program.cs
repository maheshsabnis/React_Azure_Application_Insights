// =============================================================================
// Program.cs - Application Entry Point
// =============================================================================
// This is the bootstrap file for the ASP.NET Core 8 Web API that serves as the
// backend for the Azure Application Insights Dashboard. It configures:
// - Serilog structured logging
// - Microsoft Entra ID (Azure AD) JWT bearer authentication
// - Azure SDK clients (LogsQueryClient, MetricsQueryClient) for querying App Insights
// - Dependency injection for service layer (CLSLogsService, CLSMetricsService, CLSKqlService)
// - Swagger/OpenAPI documentation
// - CORS policy for the React SPA development server
// - Global error handling with ProblemDetails responses
// =============================================================================

using Azure.Identity;
using Azure.Monitor.Query;
using AppInsights.Api.Configuration;
using AppInsights.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Serilog;

// Step 1: Create a bootstrap logger for capturing startup errors before the full pipeline is built
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Step 2: Replace the default logging with Serilog for structured, configurable logging
    builder.Host.UseSerilog((context, config) => config
        .ReadFrom.Configuration(context.Configuration)
        .WriteTo.Console());

    // Step 3: Configure Entra ID (Azure AD) JWT bearer authentication
    // Microsoft.Identity.Web reads the "AzureAd" section from appsettings.json
    // and sets up token validation automatically
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

    // Override audience validation to accept both GUID and URI formats of the app ID
    // This is necessary because tokens may contain either format depending on the client
    builder.Services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters.ValidAudiences = new[]
        {
            "<YOUR_API_APP_REGISTRATION_CLIENT_ID>",
            "api://<YOUR_API_APP_REGISTRATION_CLIENT_ID>",
        };
    });

    builder.Services.AddAuthorization();

    // Step 4: Bind Azure settings from configuration and create Azure SDK clients
    // CLSAzureSettings holds TenantId, ClientId, ClientSecret, and WorkspaceId
    builder.Services.Configure<CLSAzureSettings>(builder.Configuration.GetSection(CLSAzureSettings.SectionName));
    var azureSettings = builder.Configuration.GetSection(CLSAzureSettings.SectionName).Get<CLSAzureSettings>();

    // Create Azure credential and register LogsQueryClient + MetricsQueryClient as singletons
    // These clients are thread-safe and should be reused across requests
    if (azureSettings != null && !string.IsNullOrEmpty(azureSettings.ClientId))
    {
        // Use explicit client credentials when ClientId is configured (CI/CD, production)
        var credential = new ClientSecretCredential(azureSettings.TenantId, azureSettings.ClientId, azureSettings.ClientSecret);
        builder.Services.AddSingleton(new LogsQueryClient(credential));
        builder.Services.AddSingleton(new MetricsQueryClient(credential));
    }
    else
    {
        // Fallback to DefaultAzureCredential chain: Azure CLI, Managed Identity, Visual Studio, etc.
        var credential = new DefaultAzureCredential();
        builder.Services.AddSingleton(new LogsQueryClient(credential));
        builder.Services.AddSingleton(new MetricsQueryClient(credential));
    }

    // Step 5: Register application services with dependency injection (scoped = per-request)
    builder.Services.AddScoped<CLSILogsService, CLSLogsService>();       // Logs, traces, exceptions
    builder.Services.AddScoped<CLSIMetricsService, CLSMetricsService>(); // Metrics, dependencies, availability
    builder.Services.AddScoped<CLSIKqlService, CLSKqlService>();         // Raw KQL execution, saved queries

    // Step 6: Configure ASP.NET Core features
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "AppInsights Dashboard API", Version = "v1" });
    });

    // Configure CORS to allow the React Vite dev server to call the API
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // In-memory cache for potential caching of expensive query results
    builder.Services.AddMemoryCache();

    var app = builder.Build();

    // Step 7: Configure the HTTP request pipeline (middleware order matters!)
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseSerilogRequestLogging(); // Log every HTTP request with Serilog
    app.UseCors();

    // Global exception handler: catches unhandled exceptions and returns ProblemDetails JSON
    // In development, includes the exception message; in production, returns a generic message
    app.UseExceptionHandler(appError =>
    {
        appError.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/problem+json";
            var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
            if (error != null)
            {
                Log.Error(error.Error, "Unhandled exception");
                await context.Response.WriteAsJsonAsync(new
                {
                    status = 500,
                    title = "Internal Server Error",
                    detail = app.Environment.IsDevelopment() ? error.Error.Message : "An unexpected error occurred."
                });
            }
        });
    });

    // Authentication must come before Authorization in the pipeline
    app.UseAuthentication();
    app.UseAuthorization();

    // Map attribute-routed controllers (e.g., [Route("api/[controller]")])
    app.MapControllers();

    Log.Information("AppInsights Dashboard API starting on {Urls}", string.Join(", ", app.Urls));
    app.Run();
}
catch (Exception ex)
{
    // Log fatal startup errors before the application terminates
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    // Ensure all buffered log events are flushed to sinks before process exit
    Log.CloseAndFlush();
}
