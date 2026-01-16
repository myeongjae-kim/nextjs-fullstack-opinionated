#!/bin/sh

set -eu

PORT="${PORT:-8080}"

# Ensure DENO_DIR exists and is writable. Lambda container runtime: only /tmp is writable.
: "${DENO_DIR:=/tmp/deno_dir}"
mkdir -p "${DENO_DIR}"

# Seed cache (baked into the image) into /tmp on cold start.
if [ -d "/var/deno_dir_seed" ] && [ -z "$(ls -A "${DENO_DIR}" 2>/dev/null || true)" ]; then
  cp -a /var/deno_dir_seed/. "${DENO_DIR}/"
fi

# Run without --env-file; Lambda provides env vars via configuration.
exec deno run -A app/index.ts --port="${PORT}"

