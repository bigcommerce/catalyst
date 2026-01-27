#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Ignition Deploy E2E Harness
# Exercises: link → build → deploy against live
# Ignition infrastructure.
# ──────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# ── Logging helpers ──────────────────────────

log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"
}

log_section() {
  echo ""
  echo "════════════════════════════════════════"
  echo "  $*"
  echo "════════════════════════════════════════"
  echo ""
}

run_step() {
  local label="$1"
  shift
  local logfile="/tmp/e2e-${label}.log"

  log "▶ step=${label}"
  log "  command: $*"
  log "  cwd: $(pwd)"

  if "$@" > >(tee "$logfile") 2>&1; then
    local rc=0
  else
    local rc=$?
  fi

  log "  exit_code=${rc}"

  if [ "$rc" -ne 0 ]; then
    log "  ✗ Step '${label}' failed — last 50 lines:"
    tail -n 50 "$logfile" || true
    exit "$rc"
  fi

  log "  ✓ Step '${label}' succeeded"
}

# ── Preflight checks ────────────────────────

log_section "Preflight"

REQUIRED_VARS=(
  BIGCOMMERCE_STORE_HASH
  BIGCOMMERCE_ACCESS_TOKEN
  BIGCOMMERCE_STOREFRONT_TOKEN
  BIGCOMMERCE_CHANNEL_ID
  AUTH_SECRET
  BIGCOMMERCE_PROJECT_UUID
)

for var in "${REQUIRED_VARS[@]}"; do
  val="${!var:-}"
  if [ -z "$val" ]; then
    log "✗ Missing required env var: ${var}"
    exit 1
  fi
  log "  ${var} is set (${#val} chars)"
done

log "  node: $(node --version)"
log "  pnpm: $(pnpm --version)"
log "  HOME: ${HOME}"

mkdir -p "$HOME"

# ── Step 1: Link ─────────────────────────────

log_section "Step 1 — Link"

cd "${REPO_ROOT}/core"

run_step "link" pnpm catalyst link --project-uuid "$BIGCOMMERCE_PROJECT_UUID"

if [ ! -f .bigcommerce/project.json ]; then
  log "✗ .bigcommerce/project.json was not created"
  exit 1
fi

log "  project.json exists ✓"

# ── Step 2: Build ────────────────────────────

log_section "Step 2 — Build"

run_step "build" pnpm catalyst build --framework catalyst

if [ ! -d .bigcommerce/dist ] || [ -z "$(ls -A .bigcommerce/dist)" ]; then
  log "✗ .bigcommerce/dist/ is missing or empty"
  exit 1
fi

log "  dist/ is non-empty ✓"

# ── Step 3: Deploy ───────────────────────────

log_section "Step 3 — Deploy"

run_step "deploy" pnpm catalyst deploy \
  --project-uuid "$BIGCOMMERCE_PROJECT_UUID" \
  --secret "BIGCOMMERCE_STORE_HASH=$BIGCOMMERCE_STORE_HASH" \
  --secret "BIGCOMMERCE_STOREFRONT_TOKEN=$BIGCOMMERCE_STOREFRONT_TOKEN" \
  --secret "BIGCOMMERCE_CHANNEL_ID=$BIGCOMMERCE_CHANNEL_ID" \
  --secret "AUTH_SECRET=$AUTH_SECRET"

# ── Step 4: Extract deployment URL ───────────

log_section "Step 4 — Extract deployment URL"

DEPLOY_URL=""
if [ -f /tmp/e2e-deploy.log ]; then
  DEPLOY_URL=$(grep -oP 'Deployment URL: \K\S+' /tmp/e2e-deploy.log || true)
fi

if [ -z "$DEPLOY_URL" ]; then
  log "⚠ No deployment URL found in deploy output — skipping URL validation"
  log "  (deploy succeeded; URL validation is additive)"
  exit 0
fi

log "  Deployment URL: ${DEPLOY_URL}"

# ── Step 5: Validate deployment URL ──────────

log_section "Step 5 — Validate deployment URL"

DELAY=15
MAX_DELAY=120
MAX_ATTEMPTS=10

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  log "  Attempt ${attempt}/${MAX_ATTEMPTS} (delay=${DELAY}s)"
  sleep "$DELAY"

  HTTP_CODE=$(curl -s -o /tmp/e2e-url-response.txt -w '%{http_code}' "$DEPLOY_URL" || echo "000")
  BODY_SIZE=$(wc -c < /tmp/e2e-url-response.txt | tr -d ' ')

  log "  HTTP ${HTTP_CODE}, body size: ${BODY_SIZE} bytes"

  if [ "$HTTP_CODE" = "200" ] && grep -qi '<html' /tmp/e2e-url-response.txt; then
    log "  ✓ Deployment is live — HTTP 200 with <html marker"
    log "  First 500 chars of response:"
    head -c 500 /tmp/e2e-url-response.txt
    echo ""
    exit 0
  fi

  # Exponential backoff
  DELAY=$((DELAY * 2))
  if [ "$DELAY" -gt "$MAX_DELAY" ]; then
    DELAY=$MAX_DELAY
  fi
done

log "✗ Deployment URL validation failed after ${MAX_ATTEMPTS} attempts"
log "  Last response (full body):"
cat /tmp/e2e-url-response.txt || true
exit 1
