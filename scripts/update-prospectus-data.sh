#!/usr/bin/env bash
# Prospectus data refresh helper — run manually each admission cycle.
# 1. Download latest undergraduate prospectuses from official university sites
# 2. Update src/db/seeds/extended-programs.ts and src/db/seed.ts APS values
# 3. Set DATA_UPDATED_AT in src/lib/constants.ts
# 4. Run: npm run db:seed
set -euo pipefail
echo "Prospectus refresh is a manual step."
echo "Update seed files with verified APS from official prospectuses, then run npm run db:seed"
echo "Current data verified date: see DATA_UPDATED_AT in src/lib/constants.ts"
