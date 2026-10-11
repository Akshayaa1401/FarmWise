# Seed Recommendation Fix

## Root cause found
- The backend evaluated the seed catalog but returned only the top three varieties (`RecommendationService` used `.limit(3)`).
- The Recommendations page also sliced fresh results and rendered only three items.
- Farm Memory matching required an exact display-name match, so a saved review named `Jaya` did not match the catalog name `Jaya Rice`.

## Changes made
- The backend now returns all evaluated paddy seed varieties ranked by the existing suitability score.
- The Recommendations page now displays all returned varieties and updates the explanatory text accordingly.
- Farm Memory seed-name matching now normalizes case, punctuation, whitespace, and generic crop words such as `Rice` or `Paddy`, allowing names such as `Jaya` and `Jaya Rice` to match.
- Existing context checks remain in place: a harvest outcome affects the ranking only when recorded soil, water availability, and season are comparable to the current farm profile. Incomparable or incomplete records are not treated as evidence.
- Seed comparison continues to pass up to three recommendations as its comparison shortlist, preserving its existing behavior.

## Validation status
- Source inspection confirms the hard-coded top-three limit was removed from fresh recommendation generation and rendering.
- Source inspection confirms normalized seed-name matching is used for Farm Memory records.
- Frontend build was not completed: dependency installation (`npm ci`) timed out in this environment.
- Backend tests were not run because Maven is not installed in this environment.
- Please restart the backend and generate fresh recommendations to see all catalog varieties. Previously saved recommendation-history entries remain historical snapshots and may still contain only the three items that were saved at the time.
