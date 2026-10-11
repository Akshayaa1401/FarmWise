package com.farmwise.services;

/** Shared server-side rule for seed bag limits. Inventory quantities are whole bags/packages. */
public final class SeedBookingLimit {
    private static final double BAGS_PER_ACRE = 4.0;

    private SeedBookingLimit() {}

    public static int maxBagsForAcres(double acres) {
        if (!Double.isFinite(acres) || acres <= 0) {
            throw new IllegalArgumentException("Farm area must be a finite positive number of acres.");
        }
        return (int) Math.floor((acres * BAGS_PER_ACRE) + 1e-9);
    }
}
