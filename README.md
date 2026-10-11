# FarmWise — Paddy Seed Decision Support

FarmWise is a React + Vite frontend with a Java 17 / Spring Boot backend and MongoDB persistence. This archive contains the frontend and backend source code.

## Project layout

- `frontend/` — React + Vite UI
- `backend/` — Spring Boot REST API
- `.env.example` — environment-variable examples

## Important data note

The 13 rice/paddy seed entries and Telangana shop/inventory entries created at backend startup are **demonstration placeholders**, not verified current retail offers or guaranteed agronomic recommendations. Verify seed suitability, prices, stock, package weights, and seed rates with a local agricultural extension officer or authorized dealer before making real purchasing decisions. FarmWise filters the UI/API to paddy/rice varieties only.

## Requirements

- Java 17
- Maven 3.8+ (or IntelliJ IDEA's bundled Maven)
- Node.js 18+ and npm
- MongoDB running locally on `mongodb://localhost:27017`

## Start the backend on Windows

1. Start the MongoDB service (if installed as a Windows service): `net start MongoDB`.
2. Open the `backend` folder as a Maven project in IntelliJ IDEA and wait for dependencies to import.
3. Run `src/main/java/com/farmwise/FarmWiseApplication.java`.
4. Backend default URL: `http://localhost:8080`.

Alternatively, from a terminal in `backend`, run `mvn spring-boot:run` if Maven is installed. The archive does not rely on a bundled Maven wrapper script.

## Start the frontend

In a terminal, run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The backend CORS configuration also allows `http://localhost:5174`.

## Environment variables

- `FARMWISE_JWT_SECRET`: set a private random value (at least 32 bytes) outside local development.
- `OPENWEATHER_API_KEY`: required for live weather. If absent, the Weather card reports that weather is unavailable.
- `FARMWISE_PADDY_SEED_RATE_KG_PER_ACRE`: optional, but set only after verifying the appropriate local seed rate. When not configured, bookings do not enforce an acreage-based quantity limit and explain why.
- `VITE_API_BASE_URL`: optional frontend backend base URL, default `http://localhost:8080`.

Do not put real API keys or secrets in source files or commit `.env` files.

## Features

- Farmer registration/login with JWT authentication
- Saved farm profile and paddy-only seed catalog
- Profile-based recommendations and separate manual comparison of 2–3 varieties
- Seed booking with atomic stock reservation and guarded cancellation
- Idempotent backend startup seeding of bookable demonstration paddy inventory across all 33 Telangana districts; the saved farmer location filter still limits visible shops to matching areas
- Farm Memory for farmer-entered harvest experiences; only records with matching recorded soil, water, and season conditions influence later recommendations and comparison
- Weather card based on saved farm location, with 10-minute cache when API access is configured

## Verification notes

Run `npm install` and `npm run build` inside `frontend/`. Run `mvn test` inside `backend/` after Maven dependencies are available and MongoDB is running. On backend startup, FarmWise adds a demo shop for each of Telangana’s 33 districts and links it to existing paddy seed catalog records. Stable IDs prevent duplicates across restarts. The generated inventory is marked as demonstration data with sample stock/prices; it is not a verified real-world shop listing. The saved farmer location filter should show only matching district/location shops. Replace demo data with verified local shops before real-world use. The current build was syntax-scanned in the editing environment, but full frontend production and backend integration builds could not be executed here because Vite dependencies and Maven were unavailable. Do not treat the project as deployment-ready until those commands and end-to-end flows pass on your machine.


## Farm Resources

The main navigation includes **Farm Resources** instead of a separate seed-catalog browsing page. The database-backed seed variety data and API remain in place because recommendations, comparisons, Farm Memory, and shop/booking features depend on them. Individual variety details are available through internal links from those features. Farm Resources provides general educational topics for cultivation, soil nutrient management, and responsible pest and disease management. Resource guidance is educational and does not replace local agronomic advice or approved product labels.


## Crop problem and agricultural product workflow (prototype)

- Use **Crop Problems** to record crop, problem category, symptoms, treatment already tried, and current outcome. Records are saved per authenticated farmer in Farm Memory, and the treatment/outcome can be updated later from the record details.
- Guidance is rule-based and informational only; it is not a confirmed diagnosis or a pesticide/fertilizer dosage recommendation. Confirm the cause and follow the product label and qualified local advice.
- Shops now support product categories: seeds, fertilizers, pest-control products, and disease-management products. Search filters the displayed inventory to matching products when the search matches products rather than the shop name.
- Product booking uses atomic stock decrement and supports the four product categories. Cancellation restores reserved stock once.
- Example fertilizer and crop-protection products are clearly demonstration listings. They do not represent verified local stock, prices, registered suitability, or live nearby distances. Shop distance labels are location-text matches only, not GPS distance calculations.

### Validation

From a machine with dependencies available: run `mvn test` in `backend`, then `npm ci` and `npm run build` in `frontend`. This environment does not have Maven or installed frontend dependencies, so those full runtime/build checks cannot be claimed here.
