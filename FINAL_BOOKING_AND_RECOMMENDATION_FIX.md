# Final targeted fixes: seed booking limit and personalized recommendations

## Booking quantity
- Seed bookings now require a saved Farm Profile with a valid farm area.
- The server enforces a maximum of 4 whole seed bags/packages per acre before inventory is reserved.
- The maximum is `floor(acres * 4)` because booking quantities are whole bags/packages.
- The Shops reservation modal reads the saved acreage, displays the maximum, and disables invalid quantities. The backend remains the authoritative validator.
- Non-seed product reservations retain their existing quantity behavior; stock checks and booking IDs are unchanged.

## Recommendations
- The catalog remains dynamically loaded from MongoDB and the recommendation list remains capped at four.
- Reduced the base and crop-match score weights so scores no longer saturate at the 98-point cap for many varieties.
- Profile mismatches for soil type, irrigation, growing season, water availability, and region now affect ranking more clearly; matches add evidence to the explanation.
- Location matching checks saved location components (village/district/state) instead of comparing the entire location string to a region label.
- Existing comparable Farm Memory harvest outcomes continue to influence the relevant variety's ranking. No seed data or reviews were fabricated or deleted.

## Validation status
- Standalone Java calculation check passed for 1 acre = 4 bags, 2 acres = 8 bags, 3 acres = 12 bags, and fractional acreage rounding down to whole bags.
- Added JUnit tests for the booking-limit calculation.
- Full Maven tests were not run because Maven / the Maven wrapper executable is unavailable in this environment.
- Frontend production build was not completed because dependency installation did not finish and Vite was unavailable. Please run `npm ci` and `npm run build` locally.
