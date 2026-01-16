#!/bin/bash

set -euo pipefail

IMAGE_NAME="$(jq -r '.name' ../../deno.json)"
if [[ -z "${IMAGE_NAME}" || "${IMAGE_NAME}" == "null" ]]; then
  echo "deno.json name is required" >&2
  exit 1
fi

terraform apply \
  -var "project_name=${IMAGE_NAME}" \
  -var "profile=staging" \
  -var "image_uri=${IMAGE_URI}"