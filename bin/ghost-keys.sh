#!/usr/bin/env bash
# Derive Ghost API keys for the MCP straight from the dockerized DB via noorm.
#
# Reads the admin + content keys for a Ghost integration and prints them as
# env lines (or writes them to .env with --write). The Admin API key is the
# Ghost `{key_id}:{secret}` form; the Content API key is the bare secret.
#
#   bin/ghost-keys.sh                 # print keys for the "MCP Lab" integration
#   bin/ghost-keys.sh "Zapier"        # a different integration by name
#   bin/ghost-keys.sh --write         # write/refresh .env for the MCP
#
# Requires: the docker stack up (docker compose up -d) and noorm installed.
set -euo pipefail

cd "$(dirname "$0")/.."

WRITE=0
INTEGRATION="MCP Lab"
for arg in "$@"; do
    case "$arg" in
        --write) WRITE=1 ;;
        *) INTEGRATION="$arg" ;;
    esac
done

# shellcheck disable=SC1091
set -a; source .noorm/dev.env; set +a

row() {
    noorm --json sql "SELECT ak.secret AS secret, ak.id AS key_id FROM api_keys ak JOIN integrations i ON i.id = ak.integration_id WHERE i.name = '${INTEGRATION}' AND ak.type = '$1'" 2>/dev/null | grep '^{' | head -1
}

ADMIN_ROW=$(row admin)
CONTENT_ROW=$(row content)

if [[ -z "$ADMIN_ROW" ]]; then
    echo "No admin key found for integration '${INTEGRATION}'." >&2
    echo "Is the stack up, and does that integration exist? (Ghost Admin > Settings > Integrations)" >&2
    exit 1
fi

ADMIN_KEY="$(jq -r '.key_id' <<<"$ADMIN_ROW"):$(jq -r '.secret' <<<"$ADMIN_ROW")"
CONTENT_KEY="$(jq -r '.secret' <<<"$CONTENT_ROW")"

if [[ "$WRITE" == "1" ]]; then
    cat > .env <<EOF
# Local MCP -> dockerized Ghost (docker-compose.yml). Gitignored; throwaway creds.
# Regenerate with: bin/ghost-keys.sh --write
GHOST_URL=http://localhost:2368
GHOST_API_VERSION=v6.0
GHOST_ADMIN_API_KEY=${ADMIN_KEY}
GHOST_CONTENT_API_KEY=${CONTENT_KEY}
EOF
    echo "Wrote .env for integration '${INTEGRATION}'."
else
    echo "GHOST_ADMIN_API_KEY=${ADMIN_KEY}"
    echo "GHOST_CONTENT_API_KEY=${CONTENT_KEY}"
fi
