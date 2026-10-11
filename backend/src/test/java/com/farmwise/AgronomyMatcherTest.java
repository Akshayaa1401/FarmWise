package com.farmwise;

import com.farmwise.services.AgronomyMatcher;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AgronomyMatcherTest {
    @Test
    void recognizesFarmerFriendlyKharifLabels() {
        assertTrue(AgronomyMatcher.seasonMatches("Kharif (Rainy Season)", "Monsoon"));
        assertTrue(AgronomyMatcher.seasonMatches("Kharif", "Kharif"));
    }

    @Test
    void recognizesRabiAndZaidAliases() {
        assertTrue(AgronomyMatcher.seasonMatches("Rabi (Winter Season)", "Rabi"));
        assertTrue(AgronomyMatcher.seasonMatches("Zaid (Summer Season)", "Summer"));
    }

    @Test
    void yearRoundVarietiesMatchAnyKnownSeason() {
        assertTrue(AgronomyMatcher.seasonMatches("Kharif", "Year-Round"));
        assertFalse(AgronomyMatcher.seasonMatches("", "Kharif"));
    }
}
