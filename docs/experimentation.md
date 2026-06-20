# Local experimentation environment


A throwaway Ghost 6 instance backed by MySQL 8, plus a noorm connection for
inspecting Ghost's real database schema. Use it to exercise the MCP server
against a live Admin and Content API, and to ground new actions in the actual
data model instead of guesswork.

Everything here is local and disposable. Credentials are fixed dev values and
the whole stack resets with one command.


## Stack


`docker-compose.yml` runs two services:

- `mysql` (MySQL 8.0) on host port `3306`, database `ghost`, user `root`, password `ghost`.
- `ghost` (`ghost:6-alpine`) on host port `2368`, configured to use the MySQL service.

Ghost runs its first-boot migrations automatically and creates roughly 80
tables. Data persists in named volumes across restarts.


## Start and stop


```bash
docker compose up -d            # start (first run pulls images, ~1 min)
docker compose logs -f ghost    # watch boot and migrations
docker compose down             # stop, keep data
docker compose down -v          # stop and wipe all data
```

Override host ports without editing the compose file:

```bash
GHOST_PORT=3001 MYSQL_PORT=3307 docker compose up -d
```

Ghost is ready when `http://localhost:2368/ghost/api/admin/site/` returns 200.


## First-time Ghost setup


A fresh database has an inactive owner. Activate it once so the Admin API is
fully usable:

```bash
curl -s -X POST http://localhost:2368/ghost/api/admin/authentication/setup \
  -H "Content-Type: application/json" \
  -d '{"setup":[{"name":"Local Admin","email":"admin@localhost.test","password":"Wq9fLab-experiment-Zx42","blogTitle":"Ghost MCP Lab"}]}'
```

Ghost rejects weak or common passwords, so keep one with mixed case and no
obvious pattern. Admin UI: `http://localhost:2368/ghost/`.


## Wiring the MCP to this instance


The MCP needs `GHOST_ADMIN_API_KEY` (the `{key_id}:{secret}` form) and
`GHOST_CONTENT_API_KEY`. Create a Custom Integration in the Admin UI
(Settings > Advanced > Integrations), or pull the keys straight from the
database:

```bash
bin/ghost-keys.sh            # print the MCP Lab integration's keys
bin/ghost-keys.sh --write    # write/refresh .env for the MCP
```

`.env` is gitignored. The server reads these vars at startup
(see `src/ghost-client.ts`). The Admin key is verified to work with the exact
JWT scheme the client uses (HS256, `aud: /admin/`, hex-decoded secret).


## Inspecting the schema with noorm


noorm connects in env-only mode. No TTY, no stored config, no `noorm init`.

```bash
set -a; source .noorm/dev.env; set +a

noorm db explore                       # table / view / index counts
noorm --json sql "SELECT name FROM information_schema.tables WHERE table_schema='ghost'"
noorm --json sql "SHOW COLUMNS FROM posts"
```

`--json sql` streams one JSON object per row with a header and footer line, so
filter to the data rows before piping into jq:

```bash
noorm --json sql "SELECT slug, status FROM posts" | grep '^{' | jq -c .
```

Config lives in `.noorm/settings.yml` (the `dev` stage documents the
connection) and `.noorm/dev.env` (the env-only connection vars). Encrypted
noorm state under `.noorm/state/` is gitignored.


## Notes and caveats


- noorm creates a handful of internal `__noorm_*` bookkeeping tables in the
  Ghost database on first connect. They are harmless and isolated from Ghost's
  own tables. `docker compose down -v` clears everything.
- `protected: true` on the `dev` stage guards against `db teardown` only when
  using a stored config. Env-only mode does not carry that flag, so avoid
  running destructive `noorm db` commands against this connection.
- The dependencies for this repo are not required to run the stack or noorm.
  Run `pnpm install` only when you want to build or run the MCP server itself.
