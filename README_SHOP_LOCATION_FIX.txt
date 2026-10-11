FarmWise shop location fix notes

Changes in this archive:
- ShopLocationMatcher.java: added explicit district canonicalization and strict district equality when a known district is present in the requested location. This avoids broad token/substring matches leaking shops from another district while allowing district-wide listings.
- ShopService.java: FarmWise-generated demo shop names/locations are more realistic and do not fabricate phone numbers. Only records with the generated farmwise-demo-shop- ID prefix are updated; dealer records are not renamed.
- ShopLocationMatcherTest.java: added a regression test for three Yadadri shops and rejection of a Medchal-Malkajgiri shop.

Verification limitations in this environment:
- MongoDB is not connected here, so the live API count and actual UI count cannot be verified against the user's local farmwise_new database.
- Maven is not installed and the source archive does not contain mvnw/mvnw.cmd, so backend tests could not be run here.
- Frontend build could not run because dependency installation did not complete and Vite is unavailable.

After extracting, run the backend tests with Maven installed and run `npm ci` then `npm run build` in frontend. Check GET /api/shops?location=Bhongir%2C%20Yadadri%20Bhuvanagiri%2C%20Telangana against the local MongoDB data.
