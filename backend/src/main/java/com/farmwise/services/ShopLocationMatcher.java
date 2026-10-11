package com.farmwise.services;

import com.farmwise.models.Shop;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

public final class ShopLocationMatcher {

    private static final String DEFAULT_STATE = "telangana";

    private static final List<String> STATES_AND_UTS = Arrays.asList(
            "andhra pradesh", "arunachal pradesh", "assam", "bihar",
            "chhattisgarh", "goa", "gujarat", "haryana", "himachal pradesh",
            "jharkhand", "karnataka", "kerala", "madhya pradesh",
            "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland",
            "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
            "telangana", "tripura", "uttar pradesh", "uttarakhand",
            "west bengal", "andaman and nicobar islands", "chandigarh",
            "dadra and nagar haveli and daman and diu", "delhi",
            "jammu and kashmir", "ladakh", "lakshadweep", "puducherry"
    );

    private static final Map<String, String> DISTRICT_ALIASES =
            createDistrictAliases();

    private ShopLocationMatcher() {}

    private static Map<String, String> createDistrictAliases() {
        Map<String, String> aliases = new LinkedHashMap<>();

        String[] districts = {
                "Adilabad", "Bhadradri Kothagudem", "Hanumakonda",
                "Hyderabad", "Jagtial", "Jangaon",
                "Jayashankar Bhupalpally", "Jogulamba Gadwal",
                "Kamareddy", "Karimnagar", "Khammam",
                "Kumuram Bheem Asifabad", "Mahabubabad",
                "Mahabubnagar", "Mancherial", "Medak",
                "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool",
                "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad",
                "Peddapalli", "Rajanna Sircilla", "Rangareddy",
                "Sangareddy", "Siddipet", "Suryapet", "Vikarabad",
                "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
        };

        for (String district : districts) {
            String normalized = clean(district);
            aliases.put(normalized, normalized);
        }

        aliases.put("yadadri", "yadadri bhuvanagiri");
        aliases.put("bhuvanagiri", "yadadri bhuvanagiri");
        aliases.put("yadadri bhongir", "yadadri bhuvanagiri");
        aliases.put("bhongir", "yadadri bhuvanagiri");
        aliases.put("medchal", "medchal malkajgiri");

        return aliases;
    }

    private static String explicitDistrict(String location) {
        String normalized = clean(location);

        return DISTRICT_ALIASES.entrySet().stream()
                .filter(entry -> (" " + normalized + " ")
                        .contains(" " + entry.getKey() + " "))
                .max(Comparator.comparingInt(
                        entry -> entry.getKey().length()))
                .map(Map.Entry::getValue)
                .orElse("");
    }

    public static int matchScore(String farmerLocation, Shop shop) {
        if (shop == null) {
            return 0;
        }

        if (farmerLocation == null || farmerLocation.isBlank()) {
            return 1;
        }

        if (matches(farmerLocation, shop)) {
            String requestedDistrict = explicitDistrict(farmerLocation);
            String shopDistrict = explicitDistrict(shop.getDistrict());

            if (!requestedDistrict.isEmpty()
                    && requestedDistrict.equals(shopDistrict)) {
                return 3;
            }

            if (clean(farmerLocation).equals(clean(shop.getState()))) {
                return 1;
            }

            return 2;
        }

        return 0;
    }

    public static boolean matches(String farmerLocation, Shop shop) {
        if (shop == null) {
            return false;
        }

        String requested = clean(farmerLocation);
        String shopState = clean(shop.getState());
        String shopLocation = clean(shop.getLocation());
        String shopDistrict = clean(shop.getDistrict());

        // If no location is supplied, don't restrict the results here.
        if (requested.isEmpty()) {
            return true;
        }

        // Reject shops with contradictory state and address information.
        String addressState = findState(shopLocation);

        if (!shopState.isEmpty() && !addressState.isEmpty()
                && !shopState.equals(addressState)) {
            return false;
        }

        String effectiveShopState = !shopState.isEmpty()
                ? shopState : addressState;

        String requestedState = findState(requested);

        // An explicit state request shows shops throughout that state.
        if (!requestedState.isEmpty()) {
            if (!effectiveShopState.isEmpty()) {
                return requestedState.equals(effectiveShopState);
            }

            return requestedState.equals(DEFAULT_STATE)
                    && shopLocation.contains(DEFAULT_STATE);
        }

        // Recognized district: show shops in that district.
        String requestedDistrict = explicitDistrict(requested);

        if (!requestedDistrict.isEmpty()) {
            String storedDistrict = explicitDistrict(shopDistrict);

            if (storedDistrict.isEmpty()) {
                storedDistrict = explicitDistrict(shopLocation);
            }

            return requestedDistrict.equals(storedDistrict);
        }

        // Unknown locality: fall back to Telangana shops.
        if (!effectiveShopState.isEmpty()) {
            return DEFAULT_STATE.equals(effectiveShopState);
        }

        return shopLocation.contains(DEFAULT_STATE);
    }

    private static String findState(String value) {
        String normalized = clean(value);

        return STATES_AND_UTS.stream()
                .filter(state -> (" " + normalized + " ")
                        .contains(" " + state + " "))
                .max(Comparator.comparingInt(String::length))
                .orElse("");
    }

    private static String clean(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }
}
