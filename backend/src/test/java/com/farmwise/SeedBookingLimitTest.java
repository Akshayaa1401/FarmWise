package com.farmwise;

import com.farmwise.services.SeedBookingLimit;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SeedBookingLimitTest {
    @Test void appliesFourBagsPerAcre() {
        assertEquals(4, SeedBookingLimit.maxBagsForAcres(1.0));
        assertEquals(8, SeedBookingLimit.maxBagsForAcres(2.0));
        assertEquals(12, SeedBookingLimit.maxBagsForAcres(3.0));
    }

    @Test void roundsFractionalBagLimitsDownToWholeBags() {
        assertEquals(4, SeedBookingLimit.maxBagsForAcres(1.1));
        assertEquals(6, SeedBookingLimit.maxBagsForAcres(1.5));
    }

    @Test void rejectsInvalidAcreage() {
        assertThrows(IllegalArgumentException.class, () -> SeedBookingLimit.maxBagsForAcres(0));
        assertThrows(IllegalArgumentException.class, () -> SeedBookingLimit.maxBagsForAcres(Double.NaN));
    }
}
