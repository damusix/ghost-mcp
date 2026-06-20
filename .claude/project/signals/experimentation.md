# experimentation

## What it does

Provides a disposable local Ghost 6 + MySQL 8 stack (via Docker Compose) and noorm tooling to inspect Ghost's live database schema and extract API keys, so the MCP server can be exercised against a real Admin/Content API without a production instance.

## Artifacts

- [`docker-compose.yml`](../../../docker-compose.yml) — brings up `ghost:6-alpine` on port 2368 and `mysql:8.0` on port 3306; both services use named volumes (`ghost-mysql`, `ghost-content`) that persist across restarts; host ports overridable via `GHOST_PORT` and `MYSQL_PORT` env vars
- [`bin/ghost-keys.sh`](../../../bin/ghost-keys.sh) — derives `GHOST_ADMIN_API_KEY` and `GHOST_CONTENT_API_KEY` from the live MySQL DB via noorm SQL queries against `api_keys` and `integrations` tables; prints keys or writes `.env` with `--write`
- [`.noorm/settings.yml`](../../../.noorm/settings.yml) — noorm project config: [`sql`](../../../sql) → [`./sql`](../../../sql), [`changes`](../../../changes) → [`./changes`](../../../changes); defines a `dev` stage (`mysql`, `127.0.0.1:3306`, database `ghost`, `protected: true`) with logging silenced by default
- [`.noorm/dev.env`](../../../.noorm/dev.env) — env-only connection vars (`NOORM_CONNECTION_*`) for noorm against the Docker MySQL; matches credentials and port in [`docker-compose.yml`](../../../docker-compose.yml)
- [`sql/`](../../../sql) — placeholder directory for noorm-managed SQL files (currently empty)
- [`changes/`](../../../changes) — placeholder directory for noorm-managed schema change files (currently empty)

## Docs

- [`docs/experimentation.md`](../../../docs/experimentation.md) — setup guide: stack start/stop commands, first-time Ghost activation curl, Admin UI URL, key extraction via [`bin/ghost-keys.sh`](../../../bin/ghost-keys.sh), noorm env-only usage patterns, and caveats (noorm bookkeeping tables, `protected` flag scope)

## Coupling

- [`bin/ghost-keys.sh`](../../../bin/ghost-keys.sh) sources [`.noorm/dev.env`](../../../.noorm/dev.env) at runtime — if the env file moves or credentials change, the script breaks
- `bin/ghost-keys.sh --write` overwrites `.env` at repo root — this is the same `.env` consumed by [`src/ghost-client.ts`](../../../src/ghost-client.ts) for `GHOST_ADMIN_API_KEY` and `GHOST_CONTENT_API_KEY`; mcp-server domain is the consumer
- [`docker-compose.yml`](../../../docker-compose.yml) credentials must stay in sync with [`.noorm/dev.env`](../../../.noorm/dev.env); they are currently identical throwaway values (`root`/`ghost`)
- noorm requires [`sql/`](../../../sql) and [`changes/`](../../../changes) to exist (configured in [`.noorm/settings.yml`](../../../.noorm/settings.yml)); removing them would break `noorm` commands

## Conventions worth knowing

- The stack uses throwaway credentials (`root`/`ghost`) — not reused in any real environment
- noorm is used in env-only mode (no `noorm init`, no TTY); load vars with `set -a; source .noorm/dev.env; set +a` before running noorm commands
- `protected: true` on the `dev` stage only guards against `noorm db teardown` when using a stored config; env-only mode does not carry the flag
- `--json sql` output from noorm emits one JSON object per row plus header/footer lines; filter with `grep '^{'` before piping to `jq`
- `.noorm/state/` is gitignored; `docker compose down -v` wipes all Docker volumes and resets the Ghost schema
