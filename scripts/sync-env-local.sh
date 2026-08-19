#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${TURSO_DATABASE_URL:-}" && -n "${TURSO_AUTH_TOKEN:-}" ]]; then
  printf 'TURSO_DATABASE_URL=%s\nTURSO_AUTH_TOKEN=%s\n' \
    "$TURSO_DATABASE_URL" \
    "$TURSO_AUTH_TOKEN" > .env.local
  echo "Synced .env.local from Cursor environment secrets."
else
  echo "Turso secrets not found in environment; using existing .env.local if present."
fi
