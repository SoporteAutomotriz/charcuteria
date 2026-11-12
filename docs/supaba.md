C:\Users\Soporte\Documents\charcuteria>supabase stop
Stopping containers...
Stopped supabase local development setup.
Local data are backed up to docker volume. Use docker to show them: docker volume ls --filter label=com.supabase.cli.project=charcuteria

C:\Users\Soporte\Documents\charcuteria>supabase stop
Stopping containers...
Stopped supabase local development setup.
Local data are backed up to docker volume. Use docker to show them: docker volume ls --filter label=com.supabase.cli.project=charcuteria

C:\Users\Soporte\Documents\charcuteria>supabase start
Starting database from backup...
Starting containers...
WARNING: Analytics on Windows requires Docker daemon exposed on tcp://localhost:2375.
See https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows#running-supabase-locally for more details.
Waiting for health checks...
supabase_realtime_charcuteria container logs:
1048576
+ ulimit -n
+ '[' -n '' ']'
+ [[ -n '' ]]
+ echo 'Running migrations'
+ /app/bin/migrate
+ '[' true = true ']'
+ echo 'Seeding selfhosted Realtime'
+ /app/bin/realtime eval 'Realtime.Release.seeds(Realtime.Repo)'
[os_mon] memory supervisor port (memsup): Erlang has closed
[os_mon] cpu supervisor port (cpu_sup): Erlang has closed
+ echo 'Starting Realtime'
+ ulimit -n
+ exec /app/bin/server
Running migrations
21:55:24.360 [info] Migrations already up
Seeding selfhosted Realtime
21:55:26.618 [warning] Failed to load OTP-trusted CAs: :error::function_clause, falling back to hardcoded authorities
21:55:27.153 [info] Loading 118 CA(s) from :hardcoded store
21:55:30.027 [info] [driver: :tcp, port: 5369, socket: [~c"#Port<0.5>"], msg: ~c"server_setup_successfully"]
21:55:30.140 [info] [domain: [:gen_rpc, :dispatcher], "$kind": :gen_rpc_dispatcher_start]
21:55:36.984 [notice] [scope: RegionNodes, event: :tables_created]
21:55:37.174 [notice] [scope: RegionNodes, handler: :registry, event: :discovering_cluster]
21:55:37.181 [notice] [scope: RegionNodes, handler: :pg, event: :discovering_cluster]
21:55:37.181 [notice] [scope: RegionNodes, event: :scope_added]
21:55:37.182 [notice] [scope: Realtime.Tenants.Connect, event: :tables_created]
21:55:37.182 [notice] [scope: Realtime.Tenants.Connect, handler: :registry, event: :discovering_cluster]
21:55:37.182 [notice] [scope: Realtime.Tenants.Connect, handler: :pg, event: :discovering_cluster]
21:55:37.182 [notice] [scope: Realtime.Tenants.Connect, event: :scope_added]
21:55:47.064 [warning] MFA {Realtime.PromEx.Plugins.TenantGlobal, :execute_global_connection_metrics, []} encountered an error but has not been detached: %ArgumentError{message: "errors were found at the given arguments:\n\n  * 1st argument: the table identifier does not refer to an existing ETS table\n"}
21:55:47.064 [warning] MFA {Realtime.PromEx.Plugins.Tenant, :execute_tenant_metrics, []} encountered an error but has not been detached: %ArgumentError{message: "errors were found at the given arguments:\n\n  * 1st argument: the table identifier does not refer to an existing ETS table\n"}
21:55:47.081 [info] [libcluster:postgres] Connected to Postgres database
21:55:47.235 [info] Muster[nonode@nohost|realtime_channels_local] Starting
21:55:47.581 [info] Forum[nonode@nohost|users] Starting
21:55:47.904 [info] Starting Reconnector
21:55:48.907 [info] Running RealtimeWeb.Endpoint with cowboy 2.18.0 at :::4000 (http)
21:55:48.908 [info] Access RealtimeWeb.Endpoint at http://realtime.supabase.co:443
21:55:52.719 [notice] [scope: :realtime_postgres_cdc_0, event: :tables_created]
21:55:52.719 [notice] [scope: :realtime_postgres_cdc_0, handler: :registry, event: :discovering_cluster]
21:55:52.719 [notice] [scope: :realtime_postgres_cdc_0, handler: :pg, event: :discovering_cluster]
21:55:52.719 [notice] [scope: :realtime_postgres_cdc_0, event: :scope_added]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_1, event: :tables_created]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_1, handler: :registry, event: :discovering_cluster]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_1, handler: :pg, event: :discovering_cluster]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_1, event: :scope_added]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_2, event: :tables_created]
21:55:52.720 [notice] [scope: :realtime_postgres_cdc_2, handler: :registry, event: :discovering_cluster]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_2, event: :scope_added]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_2, handler: :pg, event: :discovering_cluster]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_3, event: :tables_created]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_3, handler: :registry, event: :discovering_cluster]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_3, event: :scope_added]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_3, handler: :pg, event: :discovering_cluster]
21:55:52.721 [notice] [scope: :realtime_postgres_cdc_4, event: :tables_created]
21:55:52.722 [notice] [scope: :realtime_postgres_cdc_4, handler: :registry, event: :discovering_cluster]
21:55:52.722 [notice] [scope: :realtime_postgres_cdc_4, handler: :pg, event: :discovering_cluster]
21:55:52.722 [notice] [scope: :realtime_postgres_cdc_4, event: :scope_added]
21:55:52.722 [info] Janitor started
21:55:52.723 [info] Starting MetricsCleaner
21:55:56.318 request_id=GOZ_MnH-pUrVzCkAAB1B [info] HEAD /api/ping
21:55:56.693 [warning] Zero region nodes for us-east-1 using :nonode@nohost
21:55:56.769 project=realtime-dev external_id=realtime-dev error_code=DatabaseIpVersionIsIpv4 [warning] DatabaseIpVersionIsIpv4: Tenant database host supabase_db_charcuteria resolved to an IPv4 address
21:55:56.770 project=realtime-dev external_id=realtime-dev [info] Applying migrations to supabase_db_charcuteria
21:55:56.932 project=realtime-dev external_id=realtime-dev [info] Migrations already up
21:55:56.932 project=realtime-dev external_id=realtime-dev [info] Finished applying 0 migrations for tenant realtime-dev in 161ms
21:55:57.193 error_code=DatabaseIpVersionIsIpv4 [warning] DatabaseIpVersionIsIpv4: Tenant database host supabase_db_charcuteria resolved to an IPv4 address
21:55:57.215 [info] Starting Elixir.Realtime.RateCounter for: {:plug, :requests, "realtime-dev"}
21:55:57.215 [info] Starting Elixir.Realtime.RateCounter for: {:channel, :events, "realtime-dev"}
21:55:57.356 request_id=GOZ_MnH-pUrVzCkAAB1B project=realtime-dev external_id=realtime-dev [info] GET /api/ping - Sent 200 in 1037ms
21:55:57.531 [info] Creating partitions for realtime.messages
21:55:57.574 [info] Tenant set-up successfully
Starting Realtime
1048576
=WARNING REPORT==== 9-Nov-2026::21:56:22.263929 ===
Failed to load OTP-trusted CAs: error:function_clause, falling back to hardcoded authorities
21:56:22.372 [info] [driver: :tcp, port: 5369, socket: [~c"#Port<0.7>"], msg: ~c"server_setup_successfully"]
21:56:22.373 [info] [domain: [:gen_rpc, :dispatcher], "$kind": :gen_rpc_dispatcher_start]
21:56:22.421 [notice]     :alarm_handler: {:set, {:system_memory_high_watermark, []}}
21:56:22.425 [notice] [scope: RegionNodes, event: :tables_created]
21:56:22.426 [notice] [scope: RegionNodes, handler: :pg, event: :discovering_cluster]
21:56:22.426 [notice] [scope: RegionNodes, handler: :registry, event: :discovering_cluster]
21:56:22.426 [notice] [scope: RegionNodes, event: :scope_added]
21:56:22.426 [notice] [scope: Realtime.Tenants.Connect, event: :tables_created]
21:56:22.426 [notice] [scope: Realtime.Tenants.Connect, handler: :registry, event: :discovering_cluster]
21:56:22.426 [notice] [scope: Realtime.Tenants.Connect, handler: :pg, event: :discovering_cluster]
21:56:22.426 [notice] [scope: Realtime.Tenants.Connect, event: :scope_added]
21:56:22.487 [warning] MFA {Realtime.PromEx.Plugins.TenantGlobal, :execute_global_connection_metrics, []} encountered an error but has not been detached: %ArgumentError{message: "errors were found at the given arguments:\n\n  * 1st argument: the table identifier does not refer to an existing ETS table\n"}
21:56:22.518 [warning] MFA {Realtime.PromEx.Plugins.Tenant, :execute_tenant_metrics, []} encountered an error but has not been detached: %ArgumentError{message: "errors were found at the given arguments:\n\n  * 1st argument: the table identifier does not refer to an existing ETS table\n"}
21:56:22.519 [info] Muster[realtime@127.0.0.1|realtime_channels_local] Starting
21:56:22.521 [info] Forum[realtime@127.0.0.1|users] Starting
21:56:22.531 [info] Starting Reconnector
21:56:22.539 [info] Running RealtimeWeb.Endpoint with cowboy 2.18.0 at :::4000 (http)
21:56:22.540 [info] Access RealtimeWeb.Endpoint at http://realtime.supabase.co:443
21:56:22.542 [notice] [scope: :realtime_postgres_cdc_0, event: :tables_created]
21:56:22.542 [notice] [scope: :realtime_postgres_cdc_0, handler: :registry, event: :discovering_cluster]
21:56:22.542 [info] [libcluster:postgres] Connected to Postgres database
21:56:22.542 [notice] [scope: :realtime_postgres_cdc_0, handler: :pg, event: :discovering_cluster]
21:56:22.542 [notice] [scope: :realtime_postgres_cdc_0, event: :scope_added]
21:56:22.543 [notice] [scope: :realtime_postgres_cdc_1, event: :tables_created]
21:56:22.543 [notice] [scope: :realtime_postgres_cdc_1, handler: :registry, event: :discovering_cluster]
21:56:22.543 [notice] [scope: :realtime_postgres_cdc_1, handler: :pg, event: :discovering_cluster]
21:56:22.543 [notice] [scope: :realtime_postgres_cdc_1, event: :scope_added]
21:56:22.544 [notice] [scope: :realtime_postgres_cdc_2, event: :tables_created]
21:56:22.544 [notice] [scope: :realtime_postgres_cdc_2, handler: :registry, event: :discovering_cluster]
21:56:22.544 [notice] [scope: :realtime_postgres_cdc_2, handler: :pg, event: :discovering_cluster]
21:56:22.544 [notice] [scope: :realtime_postgres_cdc_2, event: :scope_added]
21:56:22.545 [notice] [scope: :realtime_postgres_cdc_3, event: :tables_created]
21:56:22.546 [notice] [scope: :realtime_postgres_cdc_3, handler: :registry, event: :discovering_cluster]
21:56:22.546 [notice] [scope: :realtime_postgres_cdc_3, handler: :pg, event: :discovering_cluster]
21:56:22.546 [notice] [scope: :realtime_postgres_cdc_3, event: :scope_added]
21:56:22.547 [notice] [scope: :realtime_postgres_cdc_4, event: :tables_created]
21:56:22.547 [notice] [scope: :realtime_postgres_cdc_4, handler: :registry, event: :discovering_cluster]
21:56:22.547 [notice] [scope: :realtime_postgres_cdc_4, handler: :pg, event: :discovering_cluster]
21:56:22.547 [notice] [scope: :realtime_postgres_cdc_4, event: :scope_added]
21:56:22.549 [info] Janitor started
21:56:22.549 [info] Starting MetricsCleaner
supabase_storage_charcuteria container logs:
supabase_pg_meta_charcuteria container logs:
supabase_studio_charcuteria container logs:
▲ Next.js 16.4.3
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 0ms
✓ Running next.config took 621ms
Stopping containers...
supabase_realtime_charcuteria container is not ready: unhealthy (last health check exit code 7: curl: (7) Failed to connect to 127.0.0.1 port 4000 after 0 ms: Could not connect to server)
supabase_storage_charcuteria container is not ready: unhealthy (last health check exit code 1: Connecting to 127.0.0.1:5000 (127.0.0.1:5000) wget: can't connect to remote host (127.0.0.1): Connection refused)
supabase_pg_meta_charcuteria container is not ready: unhealthy (last health check exit code 1: node:internal/deps/undici/undici:15270 Error.captureStackTrace(err); ^ TypeError: fetch failed at node:internal/deps/undici/undici:15270:13 at process.processTicksAndRejections (node:internal/process/task_queues:103:5) { [cause]: Error: connect ECONNREFUSED 127.0.0.1:8080 at TCPConnectWrap.afterCon…)
supabase_studio_charcuteria container is not ready: unhealthy (last health check exit code -1: Health check exceeded timeout (2s))
Try rerunning the command with --debug to troubleshoot the error.