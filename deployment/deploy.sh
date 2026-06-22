#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

npm ci
npm run build

echo "Houssk est prêt dans $PROJECT_DIR/dist"
