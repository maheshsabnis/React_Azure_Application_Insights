import html, os

base = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.join(base, 'Article.html')

def rf(p):
    with open(os.path.join(base, p), 'r', encoding='utf-8') as f:
        return f.read()

def cb(p, lang):
    c = html.escape(rf(p).rstrip())
    return f'<div class="fh"><span class="fp">{html.escape(p)}</span><span class="fl">{lang}</span></div>\n<pre><code>{c}</code></pre>\n'

parts = []

# ===== HTML HEAD + CSS + HERO =====
parts.append('''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Building an Azure Application Insights Dashboard - ASP.NET Core 8 + React 18 Complete Guide</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.75;color:#333;background:#f9fafb}
.hero{background:linear-gradient(135deg,#0078d4 0%,#00b7c3 50%,#7fba00 100%);color:#fff;padding:50px 20px;text-align:center}
.hero h1{font-size:2em;margin-bottom:10px}
.hero p{font-size:1.05em;opacity:.95;max-width:760px;margin:0 auto}
.hero .br{margin-top:16px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
.hero .b{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);padding:4px 12px;border-radius:16px;font-size:.82em}
.c{max-width:960px;margin:0 auto;padding:24px 20px}
h2{color:#0078d4;font-size:1.5em;margin-top:40px;margin-bottom:12px;padding-bottom:6px;border-bottom:3px solid #0078d4}
h3{color:#005a9e;font-size:1.2em;margin-top:22px;margin-bottom:8px}
h4{color:#444;font-size:1.05em;margin-top:14px;margin-bottom:6px}
p{margin-bottom:11px;text-align:justify}
ul,ol{margin:8px 0 12px 20px}
li{margin-bottom:4px}
.ib{background:#e8f4fd;border-left:4px solid #0078d4;padding:12px 16px;margin:16px 0;border-radius:0 6px 6px 0}
.ib.w{background:#fff8e1;border-left-color:#f59e0b}
.ib.s{background:#e6f9e6;border-left-color:#22c55e}
.ib strong{display:block;margin-bottom:2px}
pre{background:#1e1e1e;color:#d4d4d4;padding:14px;border-radius:0 0 6px 6px;overflow-x:auto;font-size:.8em;line-height:1.5;margin:0 0 12px;white-space:pre;word-wrap:normal}
code{font-family:'Cascadia Code','Fira Code',Consolas,monospace}
p code,li code,td code{background:#f0f0f0;color:#c7254e;padding:1px 4px;border-radius:3px;font-size:.85em}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.88em}
th{background:#0078d4;color:#fff;padding:8px 10px;text-align:left}
td{padding:6px 10px;border-bottom:1px solid #e5e7eb}
tr:nth-child(even){background:#f3f4f6}
.ic{text-align:center;margin:20px 0}
.ic svg{max-width:100%}
.ic .cap{font-size:.82em;color:#666;margin-top:5px;font-style:italic}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin:14px 0}
.fc{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
.fc .icon{font-size:1.6em;margin-bottom:6px}
.fc h4{margin:0 0 4px;color:#0078d4;font-size:1em}
.fc p{font-size:.85em;color:#555;margin:0}
.step{display:flex;gap:12px;margin:14px 0}
.sn{background:#0078d4;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;font-size:.85em}
.sc{flex:1}
.toc{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:18px 24px;margin:20px 0}
.toc h3{margin-top:0;color:#0078d4}
.toc ol{margin:6px 0 0 16px}
.toc a{color:#0078d4;text-decoration:none}
.fh{background:#2d2d2d;color:#fff;padding:5px 12px;border-radius:6px 6px 0 0;font-size:.8em;display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.fp{color:#9cdcfe}.fl{color:#ce9178}
.fh+pre{border-radius:0 0 6px 6px;margin-top:0}
.footer{background:#1e293b;color:#94a3b8;text-align:center;padding:20px;margin-top:36px;font-size:.85em}
@media(max-width:600px){.hero h1{font-size:1.3em}pre{font-size:.72em;padding:10px}}
</style>
</head>
<body>
<div class="hero">
<h1>Building an Azure Application Insights Dashboard<br>with ASP.NET Core 8 API &amp; React 18</h1>
<p>A complete hands-on guide with full source code for every file &mdash; building a monitoring dashboard that queries Azure Application Insights using KQL, secured with Microsoft Entra ID.</p>
<div class="br">
<span class="b">ASP.NET Core 8</span><span class="b">React 18 + TypeScript</span><span class="b">Azure Application Insights</span><span class="b">KQL</span><span class="b">Entra ID Auth</span><span class="b">TanStack Query</span><span class="b">Recharts</span>
</div>
</div>
<div class="c">
''')

# ===== TOC =====
parts.append('''<div class="toc"><h3>Table of Contents</h3><ol>
<li><a href="#s1">Introduction</a></li>
<li><a href="#s2">What is Azure Application Insights?</a></li>
<li><a href="#s3">Features In-Depth</a></li>
<li><a href="#s4">Architecture &amp; Execution Workflow Diagram</a></li>
<li><a href="#s5">Project Structure, Prerequisites &amp; Packages</a></li>
<li><a href="#s5a">Key Azure SDK Classes Explained (LogsQueryClient, MetricsQueryClient, Serilog)</a></li>
<li><a href="#s5b">NuGet Packages Explained (Azure.Identity, Azure.Monitor.Query, Serilog)</a></li>
<li><a href="#s5c">NPM Packages Explained (@azure/msal-browser, @azure/msal-react)</a></li>
<li><a href="#s6">API: Configuration (appsettings.json, AzureSettings.cs, EntraIdSettings.cs)</a></li>
<li><a href="#s7">API: Program.cs</a></li>
<li><a href="#s8">API: Models (LogEntry.cs, MetricModels.cs, KqlModels.cs)</a></li>
<li><a href="#s9">API: Service Interfaces</a></li>
<li><a href="#s10">API: Service Implementations</a></li>
<li><a href="#s11">API: All 9 Controllers</a></li>
<li><a href="#s12">React: TypeScript Types</a></li>
<li><a href="#s13">React: Authentication</a></li>
<li><a href="#s14">React: API Client &amp; Services</a></li>
<li><a href="#s15">React: Custom Hooks</a></li>
<li><a href="#s16">React: Components</a></li>
<li><a href="#s17">React: Pages</a></li>
<li><a href="#s18">React: Layout, App, Entry Point &amp; .env</a></li>
<li><a href="#s19">KQL Deep Dive</a></li>
<li><a href="#s20">Running the Application</a></li>
<li><a href="#s21">Summary</a></li>
</ol></div>
''')

# ===== SECTION 1-3 =====
parts.append('''<h2 id="s1">1. Introduction</h2>
<p>Modern cloud applications generate enormous amounts of telemetry. <strong>Azure Application Insights</strong> is Microsoft's APM service that collects and analyzes this data. In this article, we build a <strong>full-stack monitoring dashboard</strong> with an <strong>ASP.NET Core 8 API</strong> backend and <strong>React 18 + TypeScript</strong> frontend. Every single source file is included with explanations so you can understand and reproduce the entire project.</p>
<div class="ib"><strong>Target Audience:</strong> Students, Software Engineers, .NET Developers, React Developers, and Managers wanting to understand Azure Application Insights monitoring.</div>

<h2 id="s2">2. What is Azure Application Insights?</h2>
<p>Azure Application Insights is an extensible APM service that monitors live applications, detects performance anomalies, and diagnoses issues. It stores telemetry in a <strong>Log Analytics Workspace</strong> queryable via <strong>KQL (Kusto Query Language)</strong>.</p>
<table>
<tr><th>Concept</th><th>Description</th></tr>
<tr><td>Telemetry</td><td>Data from your app: requests, dependencies, exceptions, traces, metrics</td></tr>
<tr><td>Log Analytics Workspace</td><td>Data store queried via KQL</td></tr>
<tr><td>KQL</td><td>Read-only query language similar to SQL</td></tr>
<tr><td>Smart Detection</td><td>AI that auto-detects anomalies</td></tr>
<tr><td>Application Map</td><td>Visual topology of components</td></tr>
</table>

<h2 id="s3">3. Features In-Depth</h2>
<div class="fg">
<div class="fc"><div class="icon">&#x1F4DD;</div><h4>Logs (AppTraces)</h4><p>Log messages with severity, operation ID, and properties.</p></div>
<div class="fc"><div class="icon">&#x1F310;</div><h4>Requests (AppRequests)</h4><p>HTTP request tracking: URL, duration, status code, success.</p></div>
<div class="fc"><div class="icon">&#x1F6A8;</div><h4>Exceptions (AppExceptions)</h4><p>Exception type, message, stack trace, severity.</p></div>
<div class="fc"><div class="icon">&#x1F4C8;</div><h4>Metrics (AppMetrics)</h4><p>Numeric measurements with aggregations over time.</p></div>
<div class="fc"><div class="icon">&#x1F517;</div><h4>Dependencies (AppDependencies)</h4><p>External calls to SQL, HTTP APIs, Redis with duration.</p></div>
<div class="fc"><div class="icon">&#x2705;</div><h4>Availability</h4><p>Health probes from global locations.</p></div>
</div>
<table>
<tr><th>Feature</th><th>Description</th></tr>
<tr><td>Live Metrics</td><td>Real-time streaming (~1s latency)</td></tr>
<tr><td>Transaction Diagnostics</td><td>End-to-end trace via Operation ID</td></tr>
<tr><td>Profiler</td><td>.NET performance traces</td></tr>
<tr><td>Snapshot Debugger</td><td>Debug snapshot on exception</td></tr>
<tr><td>Alerts</td><td>Metric, log, and smart detection alerts</td></tr>
<tr><td>Workbooks</td><td>Custom interactive reports</td></tr>
</table>
''')

# ===== SECTION 4: Workflow Diagram =====
parts.append('''<h2 id="s4">4. Architecture &amp; Execution Workflow</h2>
<div class="ic">
<svg width="880" height="460" viewBox="0 0 880 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:10px">
<defs><marker id="a" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#0078d4"/></marker></defs>
<rect width="880" height="460" fill="#f8fafc" rx="10"/>
<text x="440" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0078d4">Execution Workflow: React &#x2192; API &#x2192; Azure Application Insights</text>
<rect x="15" y="40" width="850" height="95" rx="7" fill="#fff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5 3"/>
<text x="30" y="58" font-size="11" font-weight="bold" fill="#3b82f6">TIER 1: React 18 SPA (Browser)</text>
<rect x="30" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="82" y="92" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">1. User Action</text>
<rect x="155" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="207" y="92" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">2. MSAL Auth</text>
<rect x="280" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="332" y="92" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">3. useQuery Hook</text>
<rect x="405" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="457" y="92" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">4. Axios+Token</text>
<rect x="530" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="582" y="92" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">5. HTTP Request</text>
<rect x="655" y="70" width="105" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6"/><text x="707" y="88" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e40af">Recharts Render</text>
<line x1="135" y1="90" x2="152" y2="90" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="260" y1="90" x2="277" y2="90" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="385" y1="90" x2="402" y2="90" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="510" y1="90" x2="527" y2="90" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="635" y1="90" x2="652" y2="90" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="582" y1="110" x2="582" y2="160" stroke="#0078d4" stroke-width="2" marker-end="url(#a)"/>
<text x="596" y="140" font-size="8" fill="#0078d4" font-weight="bold">HTTP+JWT</text>
<rect x="15" y="165" width="850" height="95" rx="7" fill="#fff" stroke="#22c55e" stroke-width="2" stroke-dasharray="5 3"/>
<text x="30" y="183" font-size="11" font-weight="bold" fill="#22c55e">TIER 2: ASP.NET Core 8 API</text>
<rect x="30" y="195" width="120" height="40" rx="4" fill="#dcfce7" stroke="#22c55e"/><text x="90" y="217" text-anchor="middle" font-size="8" font-weight="bold" fill="#166534">6. JWT Validate</text>
<rect x="170" y="195" width="120" height="40" rx="4" fill="#dcfce7" stroke="#22c55e"/><text x="230" y="217" text-anchor="middle" font-size="8" font-weight="bold" fill="#166534">7. Controller</text>
<rect x="310" y="195" width="140" height="40" rx="4" fill="#dcfce7" stroke="#22c55e"/><text x="380" y="217" text-anchor="middle" font-size="8" font-weight="bold" fill="#166534">8. Service+KQL</text>
<rect x="470" y="195" width="150" height="40" rx="4" fill="#dcfce7" stroke="#22c55e"/><text x="545" y="217" text-anchor="middle" font-size="8" font-weight="bold" fill="#166534">9. LogsQueryClient</text>
<rect x="640" y="195" width="110" height="40" rx="4" fill="#dcfce7" stroke="#22c55e"/><text x="695" y="217" text-anchor="middle" font-size="8" font-weight="bold" fill="#166534">10. JSON Result</text>
<line x1="150" y1="215" x2="167" y2="215" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="290" y1="215" x2="307" y2="215" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="450" y1="215" x2="467" y2="215" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="620" y1="215" x2="637" y2="215" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="545" y1="235" x2="545" y2="290" stroke="#7c3aed" stroke-width="2" marker-end="url(#a)"/>
<text x="560" y="268" font-size="8" fill="#7c3aed" font-weight="bold">KQL via HTTPS</text>
<rect x="15" y="295" width="850" height="70" rx="7" fill="#fff" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 3"/>
<text x="30" y="313" font-size="11" font-weight="bold" fill="#7c3aed">TIER 3: Azure Cloud</text>
<rect x="30" y="325" width="160" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="110" y="344" text-anchor="middle" font-size="9" font-weight="bold" fill="#5b21b6">Entra ID (Tokens)</text>
<rect x="220" y="325" width="180" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="310" y="344" text-anchor="middle" font-size="9" font-weight="bold" fill="#5b21b6">Application Insights</text>
<rect x="430" y="325" width="200" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="530" y="344" text-anchor="middle" font-size="9" font-weight="bold" fill="#5b21b6">Log Analytics (KQL Engine)</text>
<rect x="660" y="325" width="100" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="710" y="344" text-anchor="middle" font-size="9" font-weight="bold" fill="#5b21b6">Your App</text>
<line x1="400" y1="340" x2="427" y2="340" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#a)"/>
<line x1="630" y1="340" x2="657" y2="340" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#a)"/>
<rect x="15" y="380" width="850" height="65" rx="5" fill="#f8fafc" stroke="#e5e7eb"/>
<text x="30" y="398" font-size="10" font-weight="bold" fill="#333">Flow Summary:</text>
<text x="30" y="414" font-size="9" fill="#555">1-5: User acts &#x2192; MSAL gets JWT &#x2192; Hook fires &#x2192; Axios adds Bearer token &#x2192; HTTP to API</text>
<text x="30" y="430" font-size="9" fill="#555">6-10: JWT validated &#x2192; Controller routes &#x2192; Service builds KQL &#x2192; SDK queries Log Analytics &#x2192; DTOs &#x2192; JSON response &#x2192; Recharts renders</text>
</svg>
<div class="cap">Figure 1: Complete Execution Workflow</div>
</div>
<div class="ib"><strong>Azure Portal Screenshots:</strong> For visual guides on creating App Registrations and configuring Entra ID, refer to the official Microsoft documentation at <code>learn.microsoft.com/entra/identity-platform/quickstart-register-app</code> and <code>learn.microsoft.com/azure/azure-monitor/app/create-workspace-resource</code>.</div>
''')

# ===== SECTION 5: Structure & Packages =====
parts.append('<h2 id="s5">5. Project Structure, Prerequisites &amp; Packages</h2>')
parts.append('<h3>API NuGet Packages</h3>')
parts.append(cb('AppInsights.Api/AppInsights.Api.csproj', 'XML'))
parts.append('<h3>React NPM Packages</h3>')
parts.append(cb('client-app/package.json', 'JSON'))

# ===== NEW SECTION 5a: Key Azure SDK Classes Explained =====
parts.append('''<h2 id="s5a">5a. Key Azure SDK Classes Explained</h2>
<p>The ASP.NET Core API uses three critical classes from the Azure SDK and Serilog. Understanding what each class does is essential for working with this project.</p>

<h3>LogsQueryClient (Azure.Monitor.Query)</h3>
<p><code>LogsQueryClient</code> is the primary class from the <strong>Azure.Monitor.Query</strong> NuGet package used to execute <strong>KQL (Kusto Query Language) queries</strong> against an Azure <strong>Log Analytics Workspace</strong>. This is the class that actually talks to Azure Application Insights to fetch your telemetry data.</p>
<p><strong>What it does:</strong></p>
<ul>
    <li>Sends KQL query strings to the Azure Monitor Logs API over HTTPS</li>
    <li>Authenticates using the provided <code>TokenCredential</code> (e.g., <code>ClientSecretCredential</code> or <code>DefaultAzureCredential</code>)</li>
    <li>Returns results as a <code>LogsQueryResult</code> containing a <code>LogsTable</code> with typed columns and rows</li>
    <li>Supports configurable time ranges via <code>QueryTimeRange</code></li>
    <li>Is <strong>thread-safe</strong> and designed to be used as a <strong>singleton</strong> &mdash; create one instance and reuse it across all requests</li>
</ul>
<p><strong>How we use it in this project:</strong></p>
<ul>
    <li>Registered as a singleton in <code>Program.cs</code>: <code>builder.Services.AddSingleton(new LogsQueryClient(credential));</code></li>
    <li>Injected into <code>CLSLogsService</code>, <code>CLSMetricsService</code>, and <code>CLSKqlService</code> via constructor injection</li>
    <li>Called via <code>QueryWorkspaceAsync(workspaceId, kqlQuery, timeRange)</code> in every service method</li>
    <li>The returned <code>LogsQueryResult.Table.Rows</code> are iterated and mapped to our DTO models (e.g., <code>CLSLogEntry</code>, <code>CLSTraceItem</code>)</li>
</ul>
<div class="ib s"><strong>Example Usage:</strong><br><code>var response = await _logsClient.QueryWorkspaceAsync(_workspaceId, "AppRequests | take 10", new QueryTimeRange(TimeSpan.FromHours(24)));</code><br>This executes the KQL query <code>AppRequests | take 10</code> against the workspace, returning the first 10 request records from the last 24 hours.</div>

<h3>MetricsQueryClient (Azure.Monitor.Query)</h3>
<p><code>MetricsQueryClient</code> is the companion class from the <strong>Azure.Monitor.Query</strong> package, designed specifically for querying <strong>Azure Monitor Metrics</strong> (as opposed to logs). While <code>LogsQueryClient</code> queries log-based tables using KQL, <code>MetricsQueryClient</code> queries the Metrics API which provides pre-aggregated numeric data.</p>
<p><strong>What it does:</strong></p>
<ul>
    <li>Queries the Azure Monitor Metrics REST API using a resource ID</li>
    <li>Returns pre-aggregated metric values (average, sum, min, max, count) over time intervals</li>
    <li>Supports querying standard platform metrics (CPU, memory, request rate) and custom metrics</li>
    <li>Uses <code>MetricsQueryOptions</code> to specify aggregations, granularity, and filters</li>
    <li>Also <strong>thread-safe</strong> and designed for <strong>singleton</strong> usage</li>
</ul>
<p><strong>How we use it in this project:</strong></p>
<ul>
    <li>Registered as a singleton in <code>Program.cs</code> alongside <code>LogsQueryClient</code></li>
    <li>Injected into <code>CLSMetricsService</code> for potential direct metrics API queries</li>
    <li>In our current implementation, we primarily use <code>LogsQueryClient</code> with KQL queries against the <code>AppMetrics</code> table, which gives us more flexibility. The <code>MetricsQueryClient</code> is available for future expansion to query platform-level metrics that are not stored in the Log Analytics Workspace.</li>
</ul>

<h3>Serilog (Serilog.AspNetCore)</h3>
<p><strong>Serilog</strong> is a popular <strong>structured logging library</strong> for .NET that replaces the built-in <code>Microsoft.Extensions.Logging</code> with a more powerful, configurable logging pipeline. Unlike traditional text-based logging, Serilog captures log data as <strong>structured events</strong> with named properties, making logs easier to query and analyze.</p>
<p><strong>What it does:</strong></p>
<ul>
    <li><strong>Structured Logging:</strong> Instead of <code>log.Info("User logged in: " + userId)</code>, you write <code>Log.Information("User {UserId} logged in", userId)</code> &mdash; the <code>UserId</code> property is captured separately and can be filtered/searched independently</li>
    <li><strong>Sink-based Architecture:</strong> Log events are written to one or more &quot;sinks&quot; (outputs). In our project, we use <code>Serilog.Sinks.Console</code> to write to the terminal. Other sinks include files, Azure Application Insights, Seq, Elasticsearch, and many more.</li>
    <li><strong>Configuration from appsettings.json:</strong> Minimum log levels, overrides per namespace, and sink settings can all be configured via JSON without code changes</li>
    <li><strong>Request Logging:</strong> The <code>UseSerilogRequestLogging()</code> middleware automatically logs every HTTP request with method, path, status code, and duration</li>
    <li><strong>Bootstrap Logger:</strong> A lightweight logger is created before the host is built to capture startup errors that would otherwise be lost</li>
</ul>
<p><strong>How we use it in this project:</strong></p>
<ul>
    <li><strong>Bootstrap:</strong> <code>Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();</code> &mdash; captures startup errors</li>
    <li><strong>Host integration:</strong> <code>builder.Host.UseSerilog(...)</code> &mdash; replaces default logging, reads config from appsettings.json</li>
    <li><strong>Request logging:</strong> <code>app.UseSerilogRequestLogging()</code> &mdash; logs every HTTP request automatically</li>
    <li><strong>In services:</strong> <code>Log.Information("Executing KQL query: {Query}", query)</code> &mdash; structured log with query property</li>
    <li><strong>Fatal errors:</strong> <code>Log.Fatal(ex, "Application terminated unexpectedly")</code> &mdash; captures crash info</li>
    <li><strong>Cleanup:</strong> <code>Log.CloseAndFlush()</code> in the <code>finally</code> block ensures all buffered events are written before shutdown</li>
</ul>
''')

# ===== NEW SECTION 5b: NuGet Packages Explained =====
parts.append('''<h2 id="s5b">5b. NuGet Packages Explained (ASP.NET Core API)</h2>
<p>The API project uses the following NuGet packages. Understanding each package's role helps you know why it's included and what it provides.</p>

<h3>Azure.Identity (v1.21.0)</h3>
<p><code>Azure.Identity</code> provides <strong>Azure Active Directory (Entra ID) token authentication</strong> for Azure SDK client libraries. It is the <strong>authentication layer</strong> that proves your API's identity to Azure services.</p>
<p><strong>Key classes used in this project:</strong></p>
<ul>
    <li><strong><code>ClientSecretCredential</code></strong> &mdash; Authenticates using a tenant ID, client ID, and client secret from an Entra ID App Registration. This is what we use in production when explicit credentials are configured in <code>appsettings.json</code>. It creates an OAuth 2.0 client credentials flow token.</li>
    <li><strong><code>DefaultAzureCredential</code></strong> &mdash; A <strong>credential chain</strong> that automatically tries multiple authentication methods in order: Environment Variables &rarr; Managed Identity &rarr; Visual Studio &rarr; Azure CLI &rarr; Azure PowerShell &rarr; Interactive Browser. This is the fallback when no explicit credentials are configured, making it perfect for local development (uses your Azure CLI login) and production on Azure (uses Managed Identity).</li>
</ul>
<p><strong>Why it matters:</strong> Without this package, the <code>LogsQueryClient</code> and <code>MetricsQueryClient</code> cannot authenticate with Azure Monitor. Every API call to Log Analytics requires a valid OAuth 2.0 bearer token, and <code>Azure.Identity</code> handles obtaining and refreshing these tokens automatically.</p>

<h3>Azure.Monitor.Query (v1.7.1)</h3>
<p><code>Azure.Monitor.Query</code> is the <strong>core Azure SDK package</strong> for querying Azure Monitor data. It provides the two main client classes used throughout this project.</p>
<p><strong>What it provides:</strong></p>
<ul>
    <li><strong><code>LogsQueryClient</code></strong> &mdash; Executes KQL queries against Log Analytics Workspaces (see detailed explanation above)</li>
    <li><strong><code>MetricsQueryClient</code></strong> &mdash; Queries the Azure Monitor Metrics API (see detailed explanation above)</li>
    <li><strong><code>LogsQueryResult</code></strong> &mdash; The result object containing a <code>LogsTable</code> with <code>Columns</code> (schema) and <code>Rows</code> (data)</li>
    <li><strong><code>LogsTableRow</code></strong> &mdash; Represents a single row in the result table. Our <code>CLSLogsTableRowExtensions</code> class provides safe typed accessors (<code>FNGetString</code>, <code>FNGetInt64</code>, <code>FNGetDouble</code>, etc.) for extracting values from these rows.</li>
    <li><strong><code>QueryTimeRange</code></strong> &mdash; Specifies the time window for a query. We construct it from a <code>TimeSpan</code> parsed from user-friendly strings like &quot;24h&quot;, &quot;7d&quot;.</li>
</ul>
<p><strong>Why it matters:</strong> This single package replaces what would otherwise require manual REST API calls to <code>https://api.loganalytics.io/v1/workspaces/{id}/query</code>. The SDK handles authentication, request formatting, response parsing, retry logic, and error handling.</p>

<h3>Serilog.AspNetCore (v10.0.0) &amp; Serilog.Sinks.Console (v6.1.1)</h3>
<p><strong>Serilog.AspNetCore</strong> integrates Serilog with the ASP.NET Core hosting model. It replaces the default <code>ILogger</code> infrastructure so that all logging &mdash; from your code, from ASP.NET Core framework, from Entity Framework, etc. &mdash; flows through Serilog's pipeline.</p>
<p><strong>What Serilog.AspNetCore provides:</strong></p>
<ul>
    <li><code>UseSerilog()</code> extension method on <code>IHostBuilder</code> to replace default logging</li>
    <li><code>UseSerilogRequestLogging()</code> middleware that logs HTTP request summaries (method, path, status code, duration in ms)</li>
    <li>Configuration binding from <code>appsettings.json</code> via <code>ReadFrom.Configuration()</code></li>
    <li>Bootstrap logger support for capturing startup errors</li>
</ul>
<p><strong>What Serilog.Sinks.Console provides:</strong></p>
<ul>
    <li>The <code>WriteTo.Console()</code> sink that outputs structured log events to the terminal with timestamp, level, and message</li>
    <li>Supports colored output, configurable output templates, and theme customization</li>
    <li>In production, you would typically add additional sinks like <code>Serilog.Sinks.ApplicationInsights</code> to send logs to Azure, or <code>Serilog.Sinks.File</code> for file-based logging</li>
</ul>
''')

# ===== NEW SECTION 5c: NPM Packages Explained =====
parts.append('''<h2 id="s5c">5c. NPM Packages Explained (@azure/msal-browser, @azure/msal-react)</h2>
<p>The React application uses two Microsoft Authentication Library (MSAL) packages to implement <strong>OAuth 2.0 Authorization Code flow with PKCE</strong> against Microsoft Entra ID (Azure AD). These packages handle the entire browser-based authentication lifecycle.</p>

<h3>@azure/msal-browser (v5.8.0)</h3>
<p><code>@azure/msal-browser</code> is the <strong>core MSAL library for single-page applications</strong>. It implements the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) in the browser. This is the standard recommended by Microsoft for SPAs authenticating against Entra ID.</p>
<p><strong>Key classes and concepts:</strong></p>
<ul>
    <li><strong><code>PublicClientApplication</code></strong> &mdash; The main MSAL class that manages authentication state. Our project creates a singleton instance (<code>msalInstance</code>) in <code>AuthProvider.tsx</code> and exports it for use by the Axios interceptor. It handles token caching in <code>localStorage</code>, silent token renewal, and interactive login flows.</li>
    <li><strong><code>acquireTokenSilent()</code></strong> &mdash; Attempts to get an access token from the cache without user interaction. This is called by our Axios interceptor before every API request. If the cached token is still valid, no network call is made. If expired but a refresh token exists, it automatically refreshes.</li>
    <li><strong><code>acquireTokenRedirect()</code></strong> &mdash; When silent acquisition fails (expired session, new consent needed), this redirects the browser to the Entra ID login page. After authentication, the user is redirected back to the app.</li>
    <li><strong><code>loginRedirect()</code></strong> &mdash; Initiates the initial login flow. Called when the user clicks &quot;Sign in with Microsoft&quot; in our <code>CLSAuthGuardComponent</code>.</li>
    <li><strong><code>handleRedirectPromise()</code></strong> &mdash; Must be called on app startup to process the authentication response after returning from the Entra ID login page. Our <code>CLSAuthProviderComponent</code> calls this during initialization.</li>
    <li><strong><code>InteractionRequiredAuthError</code></strong> &mdash; An error class thrown when silent token acquisition fails and user interaction is required. Our Axios interceptor catches this to trigger a redirect login.</li>
    <li><strong><code>EventType.LOGIN_SUCCESS</code></strong> &mdash; Event fired when login completes successfully. We listen for this to set the active account.</li>
</ul>
<p><strong>Authentication flow in our app:</strong></p>
<ol>
    <li>User clicks &quot;Sign in with Microsoft&quot; &rarr; <code>loginRedirect(loginRequest)</code></li>
    <li>Browser redirects to <code>https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize</code></li>
    <li>User authenticates &rarr; Entra ID redirects back to <code>http://localhost:5173</code> with an authorization code</li>
    <li><code>handleRedirectPromise()</code> exchanges the code for access + refresh tokens (stored in localStorage)</li>
    <li>On each API call, Axios interceptor calls <code>acquireTokenSilent()</code> to get a fresh access token</li>
    <li>Token is attached as <code>Authorization: Bearer {token}</code> header</li>
</ol>

<h3>@azure/msal-react (v5.3.1)</h3>
<p><code>@azure/msal-react</code> is the <strong>React-specific wrapper</strong> around <code>@azure/msal-browser</code>. It provides React components and hooks that integrate MSAL into the React component lifecycle, making it easy to build authentication-aware UIs.</p>
<p><strong>Key components and hooks used in this project:</strong></p>
<ul>
    <li><strong><code>MsalProvider</code></strong> &mdash; A React context provider that wraps the app and makes the MSAL instance available to all child components. Our <code>CLSAuthProviderComponent</code> renders <code>&lt;MsalProvider instance={msalInstance}&gt;</code> around the entire app.</li>
    <li><strong><code>useIsAuthenticated()</code></strong> &mdash; A hook that returns <code>true</code> if the user has an active account (is logged in). Used in <code>CLSAuthGuardComponent</code> to decide whether to show the dashboard or the sign-in screen.</li>
    <li><strong><code>useMsal()</code></strong> &mdash; A hook that returns the MSAL instance, the list of accounts, and the current interaction status. We use it in <code>CLSAuthGuardComponent</code> (to call <code>loginRedirect</code>) and <code>CLSAppLayoutComponent</code> (to show the user's name and handle sign-out).</li>
    <li><strong><code>InteractionStatus</code></strong> &mdash; An enum indicating whether MSAL is currently processing a login, logout, or token acquisition. We check <code>inProgress !== InteractionStatus.None</code> to show a loading spinner while authentication is in progress.</li>
</ul>
<p><strong>Why two packages?</strong> <code>@azure/msal-browser</code> is the core library that works in any JavaScript environment (vanilla JS, Angular, Vue, etc.). <code>@azure/msal-react</code> adds React-specific bindings (context, hooks, components) so you don't have to manually manage the MSAL lifecycle with <code>useEffect</code> and <code>useState</code> &mdash; though our <code>CLSAuthProviderComponent</code> does use <code>useEffect</code> for the initial setup because MSAL v3+ requires explicit <code>initialize()</code> before any operations.</p>
''')

# ===== SECTION 6: Configuration =====
parts.append('''<h2 id="s6">6. API: Configuration</h2>
<h3>appsettings.json (with placeholders)</h3>''')
parts.append(cb('AppInsights.Api/appsettings.json', 'JSON'))
parts.append('''<div class="ib w"><strong>Security:</strong> Never commit secrets. Use <code>dotnet user-secrets</code> locally, Azure Key Vault in production.</div>''')
parts.append('<h3>CLSAzureSettings.cs</h3>')
parts.append(cb('AppInsights.Api/Configuration/AzureSettings.cs', 'C#'))
parts.append('<h3>CLSEntraIdSettings.cs</h3>')
parts.append(cb('AppInsights.Api/Configuration/EntraIdSettings.cs', 'C#'))

# Section 7: Program.cs
parts.append('<h2 id="s7">7. API: Program.cs</h2>')
parts.append(cb('AppInsights.Api/Program.cs', 'C#'))

# Section 8: Models
parts.append('<h2 id="s8">8. API: Data Models</h2>')
parts.append('<h3>LogEntry.cs</h3>')
parts.append(cb('AppInsights.Api/Models/LogEntry.cs', 'C#'))
parts.append('<h3>MetricModels.cs</h3>')
parts.append(cb('AppInsights.Api/Models/MetricModels.cs', 'C#'))
parts.append('<h3>KqlModels.cs</h3>')
parts.append(cb('AppInsights.Api/Models/KqlModels.cs', 'C#'))

# Section 9: Service Interfaces
parts.append('<h2 id="s9">9. API: Service Interfaces</h2>')
for f in ['ILogsService.cs', 'IMetricsService.cs', 'IKqlService.cs']:
    parts.append(f'<h3>{f}</h3>')
    parts.append(cb(f'AppInsights.Api/Services/{f}', 'C#'))

# Section 10: Service Implementations
parts.append('<h2 id="s10">10. API: Service Implementations</h2>')
for f, desc in [('LogsService.cs','Queries AppTraces, AppRequests, AppExceptions:'),('MetricsService.cs','Overview dashboard, dependencies, availability, metrics:'),('KqlService.cs','Raw KQL execution with safety validation:')]:
    parts.append(f'<h3>{f}</h3><p>{desc}</p>')
    parts.append(cb(f'AppInsights.Api/Services/{f}', 'C#'))

# Section 11: All Controllers
parts.append('<h2 id="s11">11. API: All 9 Controllers</h2>')
ctrls = [
    ('HealthController.cs', 'Tests Azure connectivity.'),
    ('LogsController.cs', 'GET /api/logs with severity and text search.'),
    ('TracesController.cs', 'GET /api/traces and GET /api/traces/{operationId}.'),
    ('ExceptionsController.cs', 'GET /api/exceptions and groups.'),
    ('MetricsController.cs', 'GET /api/metrics definitions and time-series.'),
    ('RequestsController.cs', 'GET /api/requests/summary for overview.'),
    ('DependenciesController.cs', 'GET /api/dependencies.'),
    ('AvailabilityController.cs', 'GET /api/availability.'),
    ('KqlController.cs', 'POST /api/kql plus saved queries CRUD.'),
]
for f, desc in ctrls:
    parts.append(f'<h3>{f}</h3><p>{desc}</p>')
    parts.append(cb(f'AppInsights.Api/Controllers/{f}', 'C#'))

# Section 12-18: React files
parts.append('<h2 id="s12">12. React: TypeScript Types</h2>')
parts.append(cb('client-app/src/types/index.ts', 'TypeScript'))

parts.append('<h2 id="s13">13. React: Authentication</h2>')
for f, lang in [('auth/msalConfig.ts','TypeScript'),('auth/AuthProvider.tsx','TSX'),('auth/AuthGuard.tsx','TSX'),('auth/index.ts','TypeScript')]:
    parts.append(f'<h3>{f.split("/")[1]}</h3>')
    parts.append(cb(f'client-app/src/{f}', lang))

parts.append('<h2 id="s14">14. React: API Client &amp; Services</h2>')
for f in ['api/client.ts','api/logsApi.ts','api/tracesApi.ts','api/exceptionsApi.ts','api/metricsApi.ts','api/kqlApi.ts']:
    parts.append(f'<h3>{f.split("/")[1]}</h3>')
    parts.append(cb(f'client-app/src/{f}', 'TypeScript'))

parts.append('<h2 id="s15">15. React: Custom Hooks</h2>')
parts.append(cb('client-app/src/hooks/useTimeRange.ts', 'TypeScript'))
parts.append(cb('client-app/src/hooks/useApiQueries.ts', 'TypeScript'))

parts.append('<h2 id="s16">16. React: Components</h2>')
for f in ['SeverityTag.tsx','StatCard.tsx','StatusTag.tsx','TraceWaterfall.tsx','SeverityFilter.tsx','PageSpin.tsx','TimeSeriesChart.tsx','index.ts']:
    parts.append(f'<h3>{f}</h3>')
    lang = 'TSX' if f.endswith('.tsx') else 'TypeScript'
    parts.append(cb(f'client-app/src/components/{f}', lang))

parts.append('<h2 id="s17">17. React: Pages</h2>')
for f in ['OverviewPage.tsx','LogsPage.tsx','TracesPage.tsx','ExceptionsPage.tsx','MetricsPage.tsx','DependenciesPage.tsx','AvailabilityPage.tsx','KqlPage.tsx']:
    parts.append(f'<h3>{f}</h3>')
    parts.append(cb(f'client-app/src/pages/{f}', 'TSX'))

parts.append('<h2 id="s18">18. React: Layout, App, Entry Point &amp; .env</h2>')
parts.append('<h3>AppLayout.tsx</h3>')
parts.append(cb('client-app/src/layouts/AppLayout.tsx', 'TSX'))
parts.append('<h3>App.tsx</h3>')
parts.append(cb('client-app/src/App.tsx', 'TSX'))
parts.append('<h3>main.tsx</h3>')
parts.append(cb('client-app/src/main.tsx', 'TSX'))
parts.append('<h3>.env (Environment Variables)</h3>')
parts.append(cb('client-app/.env', 'ENV'))
parts.append('<div class="ib w"><strong>Important:</strong> Add <code>.env</code> to <code>.gitignore</code>. Never commit credentials.</div>')

# Section 19: KQL
parts.append('''<h2 id="s19">19. KQL Deep Dive</h2>
<table>
<tr><th>Table</th><th>Contains</th></tr>
<tr><td><code>AppTraces</code></td><td>Log messages</td></tr>
<tr><td><code>AppRequests</code></td><td>HTTP requests</td></tr>
<tr><td><code>AppExceptions</code></td><td>Exceptions</td></tr>
<tr><td><code>AppDependencies</code></td><td>External calls</td></tr>
<tr><td><code>AppMetrics</code></td><td>Metrics</td></tr>
<tr><td><code>AppAvailabilityResults</code></td><td>Web tests</td></tr>
</table>
<div class="fh"><span class="fp">Example KQL Queries</span><span class="fl">KQL</span></div>
<pre><code>// Top 10 exceptions
AppExceptions | summarize count() by ExceptionType, OuterMessage | order by count_ desc | take 10

// Request volume over time
AppRequests | summarize count() by bin(TimeGenerated, 15m) | order by TimeGenerated asc

// Failure rate
AppRequests | summarize total=count(), failRate=countif(Success==false)*100.0/count()

// Distributed trace
union AppRequests, AppDependencies, AppTraces, AppExceptions
| where OperationId == "your-operation-id" | order by TimeGenerated asc

// Dependency analysis
AppDependencies | summarize avg(DurationMs), countif(Success==false)*100.0/count(), count()
  by Name, DependencyType | order by count_ desc</code></pre>
''')

# Section 20-21
parts.append('''<h2 id="s20">20. Running the Application</h2>
<div class="step"><div class="sn">1</div><div class="sc"><strong>Configure</strong><pre><code>cd AppInsights.Api
dotnet user-secrets set "Azure:TenantId" "&lt;YOUR_TENANT_ID&gt;"
dotnet user-secrets set "Azure:ClientId" "&lt;YOUR_CLIENT_ID&gt;"
dotnet user-secrets set "Azure:ClientSecret" "&lt;YOUR_SECRET&gt;"
dotnet user-secrets set "Azure:WorkspaceId" "&lt;YOUR_WORKSPACE_ID&gt;"</code></pre></div></div>
<div class="step"><div class="sn">2</div><div class="sc"><strong>Start API</strong><pre><code>dotnet run --project AppInsights.Api</code></pre></div></div>
<div class="step"><div class="sn">3</div><div class="sc"><strong>Start React</strong><pre><code>cd client-app && npm install && npm run dev</code></pre></div></div>
<div class="step"><div class="sn">4</div><div class="sc"><strong>Sign In &amp; Explore!</strong></div></div>

<h2 id="s21">21. Summary</h2>
<table>
<tr><th>Area</th><th>What We Learned</th></tr>
<tr><td>Azure App Insights</td><td>All telemetry types, KQL, Log Analytics, smart detection</td></tr>
<tr><td>ASP.NET Core 8</td><td>Service architecture, Azure.Monitor.Query SDK, JWT auth, Swagger</td></tr>
<tr><td>React 18+TS</td><td>TanStack Query, MSAL.js, Ant Design, Recharts, Monaco Editor</td></tr>
<tr><td>Security</td><td>Entra ID OAuth 2.0, JWT validation, query safety, CORS</td></tr>
</table>
</div>
<div class="footer"><strong>Azure Application Insights Dashboard</strong> &mdash; ASP.NET Core 8 + React 18<br>All diagrams are original copyright-free SVG creations.</div>
</body></html>''')

output = '\n'.join(parts)
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)
print(f'Done: {len(output):,} chars, {output.count(chr(10)):,} lines, {output.count("<pre><code>")} code blocks')
