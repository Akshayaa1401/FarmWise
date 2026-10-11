package com.farmwise;

import com.farmwise.models.Shop;
import com.farmwise.services.ShopLocationMatcher;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ShopLocationMatcherTest {
    @Test
    void matchesExactVillage() {
        Shop shop = new Shop("1", "Village Shop", "Pallegram, Telangana", "Local District", "Telangana", "", false);
        assertTrue(ShopLocationMatcher.matches("Pallegram, Telangana", shop));
    }

    @Test
    void prefersExactLocalityOverDistrictOnlyMatch() {
        Shop exactLocality = new Shop("8", "Local Shop", "Yadadri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", false);
        Shop districtOnly = new Shop("9", "District Shop", "Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", false);
        assertTrue(ShopLocationMatcher.matchScore("Yadadri, Telangana", exactLocality)
                > ShopLocationMatcher.matchScore("Yadadri, Telangana", districtOnly));
    }

    @Test
    void matchesSameDistrictAsNearbyAreaFallback() {
        Shop shop = new Shop("2", "District Shop", "Adilabad, Telangana", "Adilabad", "Telangana", "", true);
        assertTrue(ShopLocationMatcher.matches("Pallegram, Adilabad, Telangana", shop));
    }

    @Test
    void doesNotShowShopFromAnotherDistrictInSameState() {
        Shop shop = new Shop("3", "Yadadri Shop", "Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        assertFalse(ShopLocationMatcher.matches("Pallegram, Adilabad, Telangana", shop));
    }

    @Test
    void doesNotShowShopFromAnotherState() {
        Shop shop = new Shop("4", "Other Shop", "GT Road", "Amritsar", "Punjab", "", true);
        assertFalse(ShopLocationMatcher.matches("Yadadri, Telangana", shop));
    }

    @Test
    void rejectsInconsistentShopLocationAndState() {
        Shop shop = new Shop("5", "Inconsistent Shop", "Punjab", "Yadadri Bhuvanagiri", "Telangana", "", true);
        assertFalse(ShopLocationMatcher.matches("Yadadri, Telangana", shop));
    }

    @Test
    void doesNotTreatSameStateAsNearbyLocation() {
        Shop shop = new Shop("6", "Warangal Shop", "Warangal, Telangana", "Warangal", "Telangana", "", true);
        assertFalse(ShopLocationMatcher.matches("Hyderabad, Telangana", shop));
    }

    @Test
    void infersShopStateFromAddressAndStillMatchesLocality() {
        Shop shop = new Shop("7", "Nizamabad Shop", "Nizamabad, Telangana", "Nizamabad", "", "", true);
        assertTrue(ShopLocationMatcher.matches("Nizamabad, Telangana", shop));
    }
    @Test
    void matchesAllYadadriDemoShopsWhenFarmerSearchesBhongir() {
        Shop shop1 = new Shop("y1", "Yadadri Shop 1", "Bhongir, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        Shop shop2 = new Shop("y2", "Yadadri Shop 2", "Sample locality B near Bhongir, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        Shop shop3 = new Shop("y3", "Yadadri Shop 3", "Sample locality C near Bhongir, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        assertTrue(ShopLocationMatcher.matches("Bhongir, Telangana", shop1));
        assertTrue(ShopLocationMatcher.matches("Bhongir, Telangana", shop2));
        assertTrue(ShopLocationMatcher.matches("Bhongir, Telangana", shop3));
    }

    @Test
    void explicitYadadriDistrictMatchesAllItsShopsAndRejectsMedchal() {
        Shop shop1 = new Shop("y1", "Sri Lakshmi Seeds & Fertilizers", "Bhongir, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        Shop shop2 = new Shop("y2", "Venkateswara Agro Traders", "Alair, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        Shop shop3 = new Shop("y3", "Sai Manikanta Seeds & Pesticides", "Choutuppal, Yadadri Bhuvanagiri, Telangana", "Yadadri Bhuvanagiri", "Telangana", "", true);
        Shop medchal = new Shop("m1", "Medchal Agro Traders", "Medchal, Medchal-Malkajgiri, Telangana", "Medchal-Malkajgiri", "Telangana", "", true);
        String location = "Bhongir, Yadadri Bhuvanagiri, Telangana";
        assertTrue(ShopLocationMatcher.matches(location, shop1));
        assertTrue(ShopLocationMatcher.matches(location, shop2));
        assertTrue(ShopLocationMatcher.matches(location, shop3));
        assertFalse(ShopLocationMatcher.matches(location, medchal));
    }

}
