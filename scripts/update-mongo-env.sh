#!/bin/bash

# Update MONGO_URI in both GitHub Secrets and Azure Container App

set -e

RESOURCE_GROUP="orb-game-rg-eastus2"   # change if your RG differs
CONTAINER_APP_NAME="orb-game-backend"   # change if your container-app name differs

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

info()  { echo -e "${BLUE}$*${NC}"; }
success(){ echo -e "${GREEN}$*${NC}"; }
error(){ echo -e "${RED}$*${NC}"; }

# ------------------------------------------------------------------
# 1. Read MONGO_URI from project-root .env
# ------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  error "No .env file found in project root ($PROJECT_ROOT)"; exit 1
fi

MONGO_URI=$(grep -E '^MONGO_URI=' "$PROJECT_ROOT/.env" | cut -d'=' -f2-)

if [ -z "$MONGO_URI" ]; then
  error "MONGO_URI not found in .env"; exit 1
fi

info "Using MONGO_URI from .env: $MONGO_URI"

# ------------------------------------------------------------------
# 2. Update GitHub secret via gh CLI
# ------------------------------------------------------------------
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    info "Updating GitHub secret MONGO_URI …"
    echo -n "$MONGO_URI" | gh secret set MONGO_URI --body -
    success "GitHub secret updated."
  else
    error "gh CLI not authenticated — skipping GitHub secret update.";
  fi
else
  error "gh CLI not installed — skipping GitHub secret update.";
fi

# ------------------------------------------------------------------
# 3. Update Azure Container App env var via az CLI
# ------------------------------------------------------------------
if command -v az >/dev/null 2>&1; then
  if az account show >/dev/null 2>&1; then
    info "Updating Azure Container App environment variable …"
    az containerapp update \
      --name "$CONTAINER_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --set-env-vars "MONGO_URI=$MONGO_URI" \
      --output none
    success "Azure Container App updated."
  else
    error "Azure CLI not logged in — skipping Azure update.";
  fi
else
  error "Azure CLI not installed — skipping Azure update.";
fi

success "All done!" 