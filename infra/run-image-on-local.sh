#!/bin/bash

set -euo pipefail

IMAGE_NAME="$(jq -r '.name' deno.json)"
if [[ -z "${IMAGE_NAME}" || "${IMAGE_NAME}" == "null" ]]; then
  echo "deno.json name is required" >&2
  exit 1
fi

docker run --env-file .env \
  -p 8080:8080 \
  "${IMAGE_NAME}:latest"