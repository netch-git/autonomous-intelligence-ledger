#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo " Autonomous Intelligence Ledger: Cloudflare Pages Deploy"
echo "========================================================"

PROJECT_NAME="autonomous-intelligence-ledger"

if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Deploying via CLOUDFLARE_API_TOKEN..."
  npx wrangler pages deploy . --project-name="$PROJECT_NAME" --commit-dirty=true
else
  echo "Deploying via Wrangler CLI..."
  npx wrangler pages deploy . --project-name="$PROJECT_NAME" --commit-dirty=true
fi

echo "Deployment complete."
