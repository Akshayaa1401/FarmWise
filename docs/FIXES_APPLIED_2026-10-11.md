# FarmWise fixes applied (2026-10-11)

## Shop discovery
- Added an optional explicit Area / District search to the Shops page. If supplied, it overrides the saved farm-profile location for that search only; clearing filters returns to the saved location.
- Fixed product-type filtering so choosing **All Product Types** no longer accidentally applies the seed-only inventory filter. Selecting Seeds still limits results to paddy seed items.
- Normalized the filter-active check so blank/All values do not incorrectly hide shops.

## Seed comparison
- Removed seed price from the comparison picker and removed the Price & Package Size comparison row. Prices belong in Shops, where offers can be checked by shop.
- Updated comparison intro text so it no longer promises price comparison.

## Important data limitation
The included shop records are explicitly demo/test records, not verified real businesses or live market prices. They must not be presented as verified shop data. Real shop availability depends on records present in the MongoDB database; this change does not invent real shops or real distances.

## Validation
- Source changes reviewed.
- Frontend build could not be run in this environment because Vite dependencies were not available; `npm ci` did not complete in the execution environment.
- Backend tests could not be rerun here because the ZIP contains no Maven Wrapper script and system Maven is not installed. Run the project's frontend build and backend tests locally before submission.
