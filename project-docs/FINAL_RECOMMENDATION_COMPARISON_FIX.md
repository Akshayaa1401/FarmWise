# Final recommendation and comparison fix

## Changes
- Backend recommendation generation now sorts all evaluated varieties as before, then returns and saves only the top four.
- Recommendation UI caps both fresh and historical result rendering at four varieties.
- Updated recommendation copy to state that up to four top-ranked eligible varieties are shown.
- The Compare Seeds action passes the displayed shortlist (up to four IDs) and preserves the clicked variety, including rank four.
- Compare Seeds now allows the shortlist of up to four recommendations to be browsed, while preserving the existing comparison limit of selecting two or three varieties.

## Validation
- Source-level checks confirm the backend shortlist is limited to four and the frontend display and compare-picker limits align.
- Frontend production build was not run because dependency installation timed out and Vite dependencies were unavailable.
- Backend tests were not run because Maven is unavailable in this environment.
