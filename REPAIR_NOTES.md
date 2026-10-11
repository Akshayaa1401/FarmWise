# FarmWise repair notes — 10 October 2026

## Changes made to this source archive

### Backend and decision logic
- Added shared season normalization so `Kharif (Rainy Season)` matches catalog values such as `Kharif` and `Monsoon`; likewise for Rabi/Winter and Zaid/Summer.
- Saved farm-condition snapshots with new harvest records.
- Recommendation and comparison logic now use a past harvest only when the same variety has a record under matching soil type, water availability, and season. Legacy/incomparable records do not influence scores.
- Comparison no longer presents a confident winner when the top options are too close or the selected evidence includes demonstration data.
- Bounded comparison scores to 0–100.
- Ensured the seed catalog is initialized before demo shop inventory is created, and made demo-shop/inventory seeding idempotent so a partially initialized local database can be repaired without duplicate demo stock rows.
- Generic API errors are logged server-side and no longer expose internal exception messages to the client.

### Frontend and usability
- Fixed seed detail/comparison property mismatches (`suitableRegions`, `suitableIrrigationMethods`, `advantages`, `disadvantages`, `pestResistance`) that caused stored fields to appear missing.
- Standardized farmer-facing growing-season values and fixed a profile layout style typo.
- Normalized the configured API origin to avoid accidental `//api` URLs when the environment variable ends with a slash.
- Made auth-state parsing resilient to malformed localStorage data.
- Simplified farmer-facing labels and recommendation copy; key facts stay visible while detailed rationale, risks, and limitations are expandable.
- Added short “Before you plant” checks for water, soil/fertilizer decisions, demo-data verification, and weather review. No fertilizer dose is invented.
- Added responsive navigation/layout CSS for smaller screens and respects reduced-motion settings.
- Removed internal development phase labels from the UI.

## Verification performed in this editing environment
- All 17 frontend JavaScript/JSX source files passed a TypeScript transpile-based syntax scan with zero syntax errors.
- The season-normalization helper compiled with `javac`; focused checks for Kharif/Monsoon, Rabi/Winter, Zaid/Summer, and Year-Round matching passed.
- Java source syntax scan showed no syntax-like diagnostics; a full compile could not complete because Spring/Maven dependencies are unavailable in this environment.
- A full Vite production build could not be run because frontend dependencies were not fully installed and Vite was unavailable in this environment.
- MongoDB-backed end-to-end tests were not run here.

## Before real-world use
- The bundled seed and shop records are explicitly marked demonstration data, not verified current retail offers or certified local agronomic evidence.
- Verify seed details, local prices/stock, fertilizer advice, and seed-rate limits with authorized local sources before real-world use.
- Run `npm install` then `npm run build` in `frontend/`; run `mvn test` in `backend/` with MongoDB running. Test login, profile save/update, recommendations, comparison, harvest record save/reload, booking, and cancellation.

## Additional fixes applied after the QA pass

- Farm Memory harvest validation now rejects `NaN` and infinite area/yield values, handles a null JSON body, and normalizes harvest outcomes with a locale-independent uppercase conversion.
- Personal harvest matching now compares the season actually entered for the harvest against the current target season. Older records fall back to the saved profile season when the harvest season field is absent. This is applied consistently in recommendation ranking and seed comparison.
- Seed catalog crop filtering now treats `Rice`, `Paddy`, `Rice/Paddy`, `Paddy/Rice`, and `Rice Paddy` as equivalent names for the project's supported paddy catalog instead of accidentally returning an empty list for aliases.
- Seed comparison now rejects the request if any selected seed ID is invalid, rather than silently comparing only the valid subset.
- Updated README catalog count to match the 13 demonstration seed entries.

## Verification status after these fixes

- Java season normalization helper can be compiled and checked independently.
- JSON/XML metadata and source import/brace checks can be performed without external dependencies.
- Full Spring/Maven tests, MongoDB integration tests, and Vite production build remain unverified in this environment because Maven and frontend dependencies are unavailable here. Do not treat this static verification as proof that deployment is bug-free.


Shop visibility fix (10 October 2026):
- Shop location matching now uses the farmer's state when both farmer and shop state can be identified, instead of requiring the same district/city. This lets existing MongoDB shop records in any Telangana district appear for a Telangana profile.
- The shop state can be read from either the structured `state` field or the shop address when the structured field is missing. Conflicting structured/address states and shops from another state remain excluded.
- Added focused tests for cross-district visibility, state inference, and cross-state exclusion.
- This source change does not edit, delete, or recreate MongoDB records. Runtime integration still needs to be tested on the user's machine.
