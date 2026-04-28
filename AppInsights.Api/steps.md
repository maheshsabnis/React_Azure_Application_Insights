# Steps.md — Development Conversation Log

## Project: Azure Application Insights MCP Dashboard

---

## Phase 1-4: ASP.NET Core 8 API Backend

### Step 1: Solution Scaffolding
- Created `AppInsights.Api` ASP.NET Core 8 Web API project
- Added to existing `MCPServer_ADO.sln`
- Installed NuGet packages:
  - `Azure.Monitor.Query` — for querying Log Analytics / Application Insights
  - `Azure.Identity` — for Azure authentication (ClientSecretCredential / DefaultAzureCredential)
  - `Swashbuckle.AspNetCore` — Swagger UI
  - `Serilog.AspNetCore` + `Serilog.Sinks.Console` — structured logging
- Created folder structure: `Controllers/`, `Services/`, `Models/`, `Configuration/`

### Step 2: Azure Configuration & Models
- Created `AzureSettings.cs` — holds TenantId, ClientId, ClientSecret, WorkspaceId, ResourceId
- Created model classes:
  - `LogEntry.cs` — log entries, trace items, exception entries, exception groups
  - `MetricModels.cs` — metric definitions, metric results, request summary, dependencies, availability
  - `KqlModels.cs` — KQL query request/result, saved queries, paged request

### Step 3: Services Layer
- `ILogsService` / `LogsService` — queries `traces`, `requests`, `dependencies`, `exceptions` tables via `LogsQueryClient`
  - `GetLogsAsync` — paginated trace logs with severity/search filters
  - `GetTracesAsync` — paginated request traces with duration/status filters
  - `GetTraceByOperationIdAsync` — full distributed trace by operation ID (union of requests, dependencies, traces, exceptions)
  - `GetExceptionsAsync` — paginated exceptions with type filter
  - `GetExceptionGroupsAsync` — exceptions grouped by type with count
- `IMetricsService` / `MetricsService` — queries metrics, requests summary, dependencies, availability
  - `GetRequestSummaryAsync` — dashboard overview: total requests, avg duration, failure rate, exceptions count, time series, top failing endpoints, response code distribution
  - `GetDependenciesAsync` — dependency stats grouped by name/type
  - `GetAvailabilityAsync` — availability test results
  - `GetMetricAsync` — specific metric with aggregation (avg/sum/min/max/count) and time interval
  - `GetMetricDefinitionsAsync` — list available metric names from customMetrics + performanceCounters
- `IKqlService` / `KqlService` — custom KQL execution
  - `ExecuteQueryAsync` — runs arbitrary KQL with read-only validation (blocks `.set`, `.drop`, `.delete`, `.purge`)
  - `GetSavedQueriesAsync` / `SaveQueryAsync` / `DeleteSavedQueryAsync` — CRUD for saved queries stored in local JSON file
  - Seeded with 5 default useful queries (top errors, slow requests, failed dependencies, etc.)

### Step 4: API Controllers
Created REST endpoints:

| Endpoint | Method | Controller | Description |
|---|---|---|---|
| `/api/health` | GET | HealthController | Azure connectivity check (anonymous) |
| `/api/logs` | GET | LogsController | Query trace logs |
| `/api/traces` | GET | TracesController | List request traces |
| `/api/traces/{operationId}` | GET | TracesController | Full distributed trace waterfall |
| `/api/exceptions` | GET | ExceptionsController | Query exceptions |
| `/api/exceptions/groups` | GET | ExceptionsController | Exceptions grouped by type |
| `/api/requests/summary` | GET | RequestsController | Dashboard overview stats |
| `/api/metrics` | GET | MetricsController | List available metrics |
| `/api/metrics/{name}` | GET | MetricsController | Query specific metric |
| `/api/dependencies` | GET | DependenciesController | Dependency call stats |
| `/api/availability` | GET | AvailabilityController | Availability test results |
| `/api/kql` | POST | KqlController | Execute raw KQL query |
| `/api/kql/saved` | GET/POST/DELETE | KqlController | Saved query management |

### Step 5: Program.cs Wiring
- Configured Serilog with console sink
- Registered `AzureSettings` from `appsettings.json`
- Created `LogsQueryClient` and `MetricsQueryClient` with `ClientSecretCredential` (or `DefaultAzureCredential` fallback)
- Registered all services in DI
- Configured CORS for `localhost:5173` and `localhost:3000`
- Added global exception handler returning ProblemDetails
- Added Swagger UI (available at `/swagger`)
- Added memory cache

### Build Fix: Ambiguous Type Reference
- `MetricResult` and `MetricDefinition` conflicted between `AppInsights.Api.Models` and `Azure.Monitor.Query.Models`
- Fixed by removing `using Azure.Monitor.Query.Models;` from `MetricsService.cs`

---

## Phase 5: React Dashboard Scaffolding

### Step 6: React + Vite Project Setup
- Created `client-app/` using Vite + React + TypeScript template
- Installed dependencies:
  - `antd` + `@ant-design/icons` — UI component library
  - `recharts` — charting library
  - `axios` — HTTP client
  - `@tanstack/react-query` — server state management
  - `react-router-dom` — routing
  - `@monaco-editor/react` — KQL code editor
  - `dayjs` — date formatting

### Step 7: TypeScript Types & API Client
- Created `src/types/index.ts` — TypeScript interfaces matching all API response models
- Created API service modules:
  - `src/api/client.ts` — Axios instance with base URL config
  - `src/api/logsApi.ts` — `fetchLogs()`
  - `src/api/tracesApi.ts` — `fetchTraces()`, `fetchTraceDetail()`
  - `src/api/exceptionsApi.ts` — `fetchExceptions()`, `fetchExceptionGroups()`
  - `src/api/metricsApi.ts` — `fetchRequestSummary()`, `fetchMetricDefinitions()`, `fetchMetric()`, `fetchDependencies()`, `fetchAvailability()`
  - `src/api/kqlApi.ts` — `executeKql()`, `fetchSavedQueries()`, `saveQuery()`, `deleteSavedQuery()`

### Step 8: Custom Hooks
- `src/hooks/useTimeRange.ts` — React Context for global time range selector
- `src/hooks/useApiQueries.ts` — TanStack Query hooks wrapping all API calls (`useLogs`, `useTraces`, `useRequestSummary`, `useMetric`, etc.)

### Step 9: App Shell & Navigation
- `src/layouts/AppLayout.tsx` — Ant Design Layout with:
  - Collapsible sidebar with menu items for all 8 pages
  - Top header with global time range picker, refresh button, dark/light theme toggle
  - User avatar dropdown with sign out (added later with Entra ID)

### Step 10: App.tsx & Routing
- Configured React Router v6 with routes for all pages
- Wrapped with `QueryClientProvider` (TanStack Query) and `ConfigProvider` (Ant Design theme)
- Global time range context provider

---

## Phase 6: Core Dashboard Pages

### Step 11: Overview Page
- 4 summary stat cards: Total Requests, Avg Response Time, Failure Rate, Exceptions
- Line chart: Request volume over time
- Line chart: Avg response time over time
- Bar chart: Top 5 failing endpoints
- Pie chart: Response code distribution (2xx, 3xx, 4xx, 5xx)
- Auto-refresh every 30 seconds

### Step 12: Logs Page
- Ant Design Table with columns: Timestamp, Severity, Message, Role, Operation ID
- Severity filter as clickable tag buttons (Verbose, Information, Warning, Error, Critical)
- Full-text search input
- Click row to open detail drawer with full log info including custom dimensions
- Server-side pagination

### Step 13: Traces Page
- Table of request traces: Timestamp, Name, Duration, Status, Response Code, Operation ID
- Search by operation name
- Click row to open trace waterfall drawer:
  - Shows all spans (requests, dependencies, traces, exceptions) for the operation
  - Each span rendered with color-coded type tag, name, duration, and progress bar
- Sortable by duration

### Step 14: Exceptions Page
- Two tabs: "All Exceptions" list and "Grouped by Type"
- Exception distribution chart (line chart)
- Click exception to open detail drawer with full stack trace (monospace, scrollable)
- Grouped view shows exception type, message, count, last seen

---

## Phase 7: Advanced Dashboard Pages

### Step 15: Metrics Page
- Searchable dropdown to select metric name (from `/api/metrics`)
- Aggregation selector: Avg, Sum, Min, Max, Count
- Time interval selector: 1m, 5m, 15m, 1h, 6h, 1d
- Recharts AreaChart rendering selected metric over time

### Step 16: Dependencies Page
- Table: Name, Type, Avg Duration, Failure Rate, Call Count
- Bar chart: Top 10 slowest dependencies
- Pie chart: Calls by dependency type
- Color-coded failure rate tags

### Step 17: Availability Page
- Table: Timestamp, Test Name, Location, Status, Duration, Message
- Line chart: Duration trend over time
- Search filter by test name
- Pass/Fail status tags

### Step 18: KQL Query Editor Page
- Monaco Editor for writing KQL queries
- "Run Query" button with Ctrl+Enter keyboard shortcut
- Time span selector
- Dynamic results table (columns generated from API response)
- "Export CSV" button
- Saved queries sidebar:
  - Click to load query into editor
  - Save new queries with name/description
  - Delete saved queries
  - Seeded with 5 default useful queries

---

## Reusable Components

### Step 19: Created `src/components/` with shared components
- `SeverityTag` — color-coded severity badge (Verbose→Critical) with helper functions
- `SeverityFilter` — clickable severity tag filter bar
- `StatCard` — reusable statistic card wrapper
- `StatusTag` — Success/Failed tag (green/red)
- `TimeSeriesChart` — reusable line/area chart for time series data
- `TraceWaterfall` — distributed trace span visualization with progress bars and type tags
- `PageSpin` — centered full-page loading spinner
- `index.ts` — barrel export for all components

Refactored `OverviewPage`, `LogsPage`, `TracesPage` to use these components.

---

## Entra ID (Azure AD) Authentication

### Step 20: Backend — JWT Bearer Authentication
- Installed `Microsoft.Identity.Web` NuGet package
- Created `EntraIdSettings.cs` configuration model
- Updated `Program.cs`:
  - Added `AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi()`
  - Added `UseAuthentication()` + `UseAuthorization()` middleware
- Added `[Authorize]` attribute to all controllers except `HealthController`
- Added `AzureAd` section to `appsettings.json`:
  ```json
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "57084445-e440-441f-bc3f-fabe8cbb2535",
    "ClientId": "6ba7d4c5-89fa-4f61-956a-57e9000f57fc",
    "Audience": "api://6ba7d4c5-89fa-4f61-956a-57e9000f57fc/access_as_user"
  }
  ```

### Step 21: Frontend — MSAL React Authentication
- Installed `@azure/msal-browser` + `@azure/msal-react`
- Created `src/auth/` module:
  - `msalConfig.ts` — MSAL configuration reading from `VITE_*` env vars, defines API scopes and login request
  - `AuthProvider.tsx` — wraps app with `MsalProvider`, handles async MSAL initialization (`initialize()` + `handleRedirectPromise()`), sets active account
  - `AuthGuard.tsx` — shows "Sign in with Microsoft" button if not authenticated, spinner during auth flow
  - `index.ts` — barrel export
- Updated `src/api/client.ts` — Axios interceptor that:
  - Acquires token silently via `acquireTokenSilent()`
  - Attaches `Authorization: Bearer <token>` header
  - Falls back to `acquireTokenRedirect()` on `InteractionRequiredAuthError`
- Updated `AppLayout.tsx` — added user avatar dropdown with name/email display and Sign Out button
- Updated `App.tsx` — wrapped with `<AuthProvider>` and `<AuthGuard>`
- Created `client-app/.env` with credentials:
  ```
  VITE_AZURE_TENANT_ID=57084445-e440-441f-bc3f-fabe8cbb2535
  VITE_AZURE_CLIENT_ID=76bf67b6-1227-4e12-9b6c-84f78bb9a52d
  VITE_API_SCOPE=api://6ba7d4c5-89fa-4f61-956a-57e9000f57fc/access_as_user
  VITE_API_URL=http://localhost:5027
  ```

### App Registration Setup
- **Backend API** (`6ba7d4c5-89fa-4f61-956a-57e9000f57fc`): Exposes scope `api://6ba7d4c5-89fa-4f61-956a-57e9000f57fc/access_as_user`, used for both JWT validation and Azure Monitor queries via ClientSecretCredential
- **SPA React** (`76bf67b6-1227-4e12-9b6c-84f78bb9a52d`): Single-page app registration, requests the API scope during login

---

## Troubleshooting Issues Encountered

### Issue 1: All API calls returning 401 (no token attached)
**Cause**: MSAL v5 requires `await msalInstance.initialize()` before any operations. Without it, `handleRedirectPromise()` never runs, the login redirect response is never processed, and `getActiveAccount()` returns null.
**Fix**: Moved MSAL initialization into `useEffect` in `AuthProvider.tsx` with `await msalInstance.initialize()` and `await msalInstance.handleRedirectPromise()` before rendering children.

### Issue 2: 401 — Audience validation failed (`IDX10214`)
**Cause**: The token's `aud` claim is `api://6ba7d4c5-89fa-4f61-956a-57e9000f57fc` (Application ID URI), but `Microsoft.Identity.Web` validates against the raw Client ID GUID by default. Setting `ValidAudiences` in the `AddMicrosoftIdentityWebApi` lambda was getting overwritten by the library's internal configuration.
**Fix**: Used `PostConfigure<JwtBearerOptions>` to set `ValidAudiences` AFTER `Microsoft.Identity.Web` finishes its configuration:
```csharp
builder.Services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.TokenValidationParameters.ValidAudiences = new[]
    {
        "6ba7d4c5-89fa-4f61-956a-57e9000f57fc",
        "api://6ba7d4c5-89fa-4f61-956a-57e9000f57fc",
    };
});
```

### Issue 3: 403 — InsufficientAccessError from Azure Monitor
**Cause**: The service principal for app registration `6ba7d4c5-89fa-4f61-956a-57e9000f57fc` did not have permissions to read from the Log Analytics workspace. The app registration didn't have an Enterprise Application (service principal) created in the tenant, so it couldn't be found in the IAM role assignment member picker.
**Fix**:
1. Create the service principal: `az ad sp create --id 6ba7d4c5-89fa-4f61-956a-57e9000f57fc`
2. Assign Monitoring Reader role:
```bash
az role assignment create \
  --assignee 6ba7d4c5-89fa-4f61-956a-57e9000f57fc \
  --role "Monitoring Reader" \
  --scope "/subscriptions/b202487b-cdda-40f5-8092-cb89e26351bb/resourceGroups/maheshssabnis"
```

### Issue 4: TypeScript build errors
- **Ambiguous C# types**: `MetricResult` and `MetricDefinition` conflicted between app models and Azure SDK. Fixed by removing `using Azure.Monitor.Query.Models;`.
- **MSAL type import**: `Configuration` needed `import type` with `verbatimModuleSyntax` enabled.
- **Deprecated MSAL option**: `storeAuthStateInCookie` removed (not in newer MSAL types).
- **Unused variable**: `WarningOutlined` import and `DataComponent` variable removed.
