# FarmWise bug-fix audit — 2026-10-11

## Changes made in this pass
- Booking requests now return a clear validation error when the request body or inventory ID is missing, instead of risking a null-pointer error.
- Booking validates that the inventory item references an existing shop.
- Booking rejects bookings from non-demo shops unless their verification status is `VERIFIED`, even if a caller bypasses the normal shop listing and submits an inventory ID directly.
- Existing saved-location matching remains enforced when the farmer has a saved location.

## Checks completed
- ZIP archive integrity checked after repackaging.
- `frontend/package.json`, `frontend/package-lock.json`, and `backend/pom.xml` parse successfully.
- Checked 31 frontend relative imports; no missing local import targets found.
- Java delimiter sanity check passed for 58 backend Java source/test files.
- Compiled `Shop` and `ShopLocationMatcher` with minimal annotation stubs and ran 4 matcher smoke tests: same-district fallback, exclusion of a different district, rejection of inconsistent state/address, and state inference from address all passed.

## Not fully verified
- Full Spring Boot/Maven tests were not run because Maven and the Maven wrapper executable/JAR are not available in this environment.
- Vite production build was not run: npm dependency installation stalled and did not provide a usable Vite executable.
- MongoDB-backed integration and full UI-to-booking flow were not run.
- Demo shops, stock, and prices are illustrative prototype data, not verified real dealers or live market data.
