# FarmWise Shops: Nearby Listings and Price Comparison

## Changes
- The Shops API continues to return every shop with matching location and inventory; it does not cap results at one shop per district.
- Default ordering now prioritizes the most specific textual locality match. This is a locality ranking, not a GPS distance calculation.
- The Shops page groups identical products/package sizes across matching shops, sorts those offers from lowest to highest price, and provides a reserve button beside each offer.
- Price comparison remains exclusive to Shops. Seed recommendations and seed-variety comparison were not changed.
- Existing booking flow, stock validation, and the 4-seed-bags-per-acre limit remain intact.
- Startup no longer fabricates shop records or hard-coded prices. It also removes legacy records created by FarmWise's old hard-coded demo seeders, including their associated demo inventory.
- Empty/one-shop states explain when more verified local shop records are needed. No fake shop names, prices, or stock are added to fill the list.

## Data requirement
For Yadadri to display 2–3 nearby shops, MongoDB must contain 2–3 verified shop records in/near that locality and inventory records for the same product at each shop. The application cannot truthfully compare prices for shops or products that are not in the database. Without coordinates, proximity is estimated from saved locality/district text; exact road distance is not claimed.

## Validation
- Added a unit test that verifies an exact locality match ranks above a district-only match.
- Full Maven tests and frontend production build were not run in this environment because Maven/Maven Wrapper executable and installed frontend dependencies are unavailable.
