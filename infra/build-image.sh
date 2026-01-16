#!/bin/bash

set -euo pipefail

IMAGE_NAME="$(jq -r '.name' deno.json)"
if [[ -z "${IMAGE_NAME}" || "${IMAGE_NAME}" == "null" ]]; then
  echo "deno.json name is required" >&2
  exit 1
fi
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
SHORT_SHA=$(git rev-parse --short HEAD)

docker build \
  -t "${IMAGE_NAME}:latest" \
  -t "${IMAGE_NAME}:${TIMESTAMP}-${SHORT_SHA}" \
  -f Dockerfile .