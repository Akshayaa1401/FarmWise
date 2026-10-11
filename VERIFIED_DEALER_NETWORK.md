# FarmWise Verified Dealer Network (Option B)

## What is implemented
- Shop records now include `verificationStatus`, `dealerLicenseNumber`, `ownerFarmerId`, and `verificationNotes`.
- Authenticated users can submit a dealer application using `POST /api/shops/dealer-applications`.
- Required fields: `name`, `location`, `district`, `contactPhone` (10–13 digits after removing punctuation), and `dealerLicenseNumber`.
- Applications are always saved as `PENDING`; client-supplied verification state, ID, owner, and demo status are overwritten by the backend.
- Farmer shop discovery, shop detail, and inventory APIs only expose non-demo shops with `verificationStatus: "VERIFIED"`.
- Seed/demo shops remain available only as clearly marked demo records in the database and are not presented as authorized real dealers.

## Request example
Authenticated POST `/api/shops/dealer-applications`:
```json
{
  "name": "Example Agri Inputs",
  "location": "Village, Mandal, District, Telangana",
  "district": "District name",
  "contactPhone": "9876543210",
  "dealerLicenseNumber": "LICENCE-REFERENCE"
}
```

## Verification workflow before production
1. A designated administrator checks the dealer's licence and business/contact details with the relevant authority.
2. Only after checking, set the application document's `verificationStatus` to `VERIFIED` in the `shops` MongoDB collection. Keep it `PENDING` if not verified; use `REJECTED` for rejected applications.
3. Do not mark the illustrative seeded records as verified. Real prices and stock must be entered/confirmed by the dealer and updated regularly.

**Known limitation:** this source update does not yet include a separate administrator account/approval dashboard or a dealer self-service inventory dashboard, and it does not connect to a Telangana government dealer API. Approval is a controlled manual step for this project version. Do not claim that a shop is government-verified unless the licence has actually been checked. Frontend and Maven builds could not be rerun in this environment because frontend dependencies (`vite`) and Maven are not installed here.

## Demo shop visibility update (2026-10-11)
- The college prototype now displays the three clearly labelled `DEMO ONLY` sample shops for a farmer's matched Telangana district/locality.
- Sample locations, prices, and stock are illustrative only; they are not government-verified dealers or live availability.
- Non-demo dealer applications remain hidden from farmer listings until their verification status is `VERIFIED`.
