# FarmWise Shops: no-results fix

The previous Shops update removed the app's generated demo shop and inventory records on startup, but did not provide a replacement data source. On an empty local MongoDB database, the Shops page therefore had no records to display.

The startup seeder now adds three clearly labelled `DEMO ONLY` shop records per Telangana district and sample seed inventory with different illustrative prices. This makes the nearby-shop and same-product price comparison flow testable locally. These records are explicitly not verified real shops or live prices. Replace them with verified dealer records before real-world use.

The saved farm location still filters shops by matching locality/district tokens. Price comparison remains exclusively in Shops; seed recommendation and seed comparison behavior is unchanged. Existing booking and stock-validation logic is retained.
