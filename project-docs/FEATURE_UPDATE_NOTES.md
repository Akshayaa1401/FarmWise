# FarmWise feature update

## Implemented
- Removed the Crop Problems page, route, navigation links, dashboard card copy, and recommendation-page CTA.
- Added the public Farming Guidance page with eight expandable farming stages, crop/season/variety selectors, checklists persisted in browser local storage, and cautious guidance that directs farmers to local agricultural experts for exact crop-specific recommendations.
- Reused the saved farm profile and seed catalog when available.
- Removed the shop empty-state explanation about hiding unrelated districts and simplified the shops page description without changing its location filtering or booking behavior.
- Added startup migration logic to rename demo-style district shop names to district-based `Seeds & Fertilizers` names and synchronize shop names into their inventory records. Newly seeded district shops use the same naming convention.
- Farm Memory no longer exposes crop-problem history filters or treatment-outcome editing. Old crop-problem records remain in the database but are excluded from the Farm Memory UI; no data is deleted.

## Validation status
- Source-level checks confirmed the old `/crop-problems` route and navigation references were removed, and the new `/farming-guidance` route is registered.
- Frontend production build could not be completed in this environment because the dependency installation did not complete and Vite was unavailable. Please run `npm ci` and `npm run build` in `frontend` on a machine with package-registry access.
- Backend tests/build were not run because Maven is not installed and the archive does not include the Maven wrapper script/JAR.
- Shop migration and booking flow still require runtime verification against the project's MongoDB instance.
