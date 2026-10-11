package com.farmwise.services;

import com.farmwise.models.Shop;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Restricts shop listings to the farmer's locality/district instead of showing every
 * shop in the same state. With no coordinates available, a shared district is the
 * supported fallback for nearby-village matching.
 */
public final class ShopLocationMatcher {
    private static final List<String> STATES_AND_UTS = Arrays.asList(
            "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
            "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
            "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
            "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana",
            "tripura", "uttar pradesh", "uttarakhand", "west bengal", "andaman and nicobar islands",
            "chandigarh", "dadra and nagar haveli and daman and diu", "delhi", "jammu and kashmir",
            "ladakh", "lakshadweep", "puducherry"
    );

    private static final Map<String, String> DISTRICT_ALIASES = createDistrictAliases();

    private ShopLocationMatcher() {}

    private static Map<String, String> createDistrictAliases() {
        Map<String, String> aliases = new LinkedHashMap<>();
        String[] districts = {
                "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial",
                "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
                "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
                "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu",
                "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli",
                "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet",
                "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
        };
        for (String district : districts) aliases.put(clean(district), clean(district));
        aliases.put("yadadri", "yadadri bhuvanagiri");
        aliases.put("bhuvanagiri", "yadadri bhuvanagiri");
        aliases.put("yadadri bhongir", "yadadri bhuvanagiri");
        aliases.put("medchal", "medchal malkajgiri");
        aliases.put("medchal malkajgiri", "medchal malkajgiri");
        aliases.put("rangareddy", "rangareddy");
        return aliases;
    }

    private static String explicitDistrict(String location) {
        String normalized = clean(location);
        // Prefer the longest known district phrase, so a village such as Medchal does
        // not override a full, explicitly supplied district name.
        return DISTRICT_ALIASES.entrySet().stream()
                .filter(e -> (" " + normalized + " ").contains(" " + e.getKey() + " "))
                .max(Comparator.comparingInt(e -> e.getKey().length()))
                .map(Map.Entry::getValue).orElse("");
    }

    /** Higher score means a more specific textual locality match. This is not a distance estimate. */
    public static int matchScore(String farmerLocation, Shop shop) {
        if (shop == null) return 0;
        if (farmerLocation == null || farmerLocation.isBlank()) return 0;

        Set<String> farmerParts = locationParts(farmerLocation);
        Set<String> shopParts = new LinkedHashSet<>();
        addParts(shopParts, shop.getLocation());
        addParts(shopParts, shop.getDistrict());
        shopParts.removeIf(ShopLocationMatcher::isStateOrCountry);
        if (farmerParts.isEmpty() || shopParts.isEmpty()) return 0;

        for (String farmerPart : farmerParts) {
            for (String shopPart : shopParts) {
                if (farmerPart.equals(shopPart)) return 3;
            }
        }
        for (String farmerPart : farmerParts) {
            for (String shopPart : shopParts) {
                if (isMeaningfulPartialLocationMatch(farmerPart, shopPart)) return 2;
            }
        }
        return matches(farmerLocation, shop) ? 1 : 0;
    }

    public static boolean matches(String farmerLocation, Shop shop) {
        if (shop == null) return false;
        // Preserve the existing behavior for guests/no saved location. Authenticated
        // farmer listings are filtered using the saved locality below.
        if (farmerLocation == null || farmerLocation.isBlank()) return true;

        String farmerState = findState(farmerLocation);
        String requestedDistrict = explicitDistrict(farmerLocation);
        String storedDistrict = explicitDistrict(shop.getDistrict());
        // If the farmer explicitly selected a district, enforce district equality first.
        // This prevents broad word/substring matching from leaking a different district.
        if (!requestedDistrict.isEmpty()) {
            if (storedDistrict.isEmpty()) storedDistrict = explicitDistrict(shop.getLocation());
            if (!storedDistrict.isEmpty() && !requestedDistrict.equals(storedDistrict)) return false;
            if (!storedDistrict.isEmpty() && requestedDistrict.equals(storedDistrict)) return true;
        }
        String shopState = clean(shop.getState());
        String locationState = findState(shop.getLocation());

        // Reject contradictory shop state/address data and shops from another state.
        if (!shopState.isEmpty() && !locationState.isEmpty() && !shopState.equals(locationState)) {
            return false;
        }
        String effectiveShopState = !shopState.isEmpty() ? shopState : locationState;
        if (!farmerState.isEmpty() && !effectiveShopState.isEmpty()
                && !farmerState.equals(effectiveShopState)) {
            return false;
        }

        Set<String> farmerParts = locationParts(farmerLocation);
        Set<String> shopParts = new LinkedHashSet<>();
        addParts(shopParts, shop.getDistrict());
        addParts(shopParts, shop.getLocation());
        shopParts.removeIf(ShopLocationMatcher::isStateOrCountry);

        if (farmerParts.isEmpty() || shopParts.isEmpty()) return false;

        // Match the same village/locality or a shared district/mandal token. Do not
        // treat a shared state name as sufficient to call a shop nearby.
        for (String farmerPart : farmerParts) {
            for (String shopPart : shopParts) {
                if (farmerPart.equals(shopPart)
                        || isMeaningfulPartialLocationMatch(farmerPart, shopPart)) {
                    return true;
                }
            }
        }
        return false;
    }

    private static boolean isMeaningfulPartialLocationMatch(String first, String second) {
        // Support common shortened district names (e.g. "Yadadri" and
        // "Yadadri Bhuvanagiri") without matching on tiny/common fragments.
        return Math.min(first.length(), second.length()) >= 5
                && (first.contains(second) || second.contains(first));
    }

    private static Set<String> locationParts(String value) {
        Set<String> parts = new LinkedHashSet<>();
        addParts(parts, value);
        parts.removeIf(ShopLocationMatcher::isStateOrCountry);
        return parts;
    }

    private static void addParts(Set<String> target, String value) {
        if (value == null || value.isBlank()) return;
        String[] segments = value.split("[,;|/]");
        for (String segment : segments) {
            String normalized = clean(segment);
            if (!normalized.isEmpty() && !normalized.equals("india") && !containsStateOnly(normalized)) {
                target.add(normalized);
                // Demo shop addresses may be written as "Sample locality B near Bhongir".
                // Keep meaningful words too, so a farmer searching only "Bhongir" can find
                // all three shops in that district instead of only the first shop whose
                // locality is exactly Bhongir. Ignore short/common words to avoid broad matches.
                for (String word : normalized.split("\\s+")) {
                    if (word.length() >= 5 && !isStateOrCountry(word) && !word.equals("sample")
                            && !word.equals("locality") && !word.equals("district")) {
                        target.add(word);
                    }
                }
            }
        }
        // If the user entered a single village/locality without separators, retain it
        // as a matchable value. Do not add a whole comma-separated address as one token.
        if (segments.length == 1) {
            String normalizedWhole = clean(value);
            if (!normalizedWhole.isEmpty() && !normalizedWhole.equals("india")
                    && !containsStateOnly(normalizedWhole)) {
                target.add(normalizedWhole);
            }
        }
    }

    private static String findState(String value) {
        String normalized = clean(value);
        return STATES_AND_UTS.stream()
                .filter(s -> (" " + normalized + " ").contains(" " + s + " "))
                .max(Comparator.comparingInt(String::length)).orElse("");
    }

    private static boolean isStateOrCountry(String value) {
        return value.equals("india") || STATES_AND_UTS.contains(value);
    }

    private static boolean containsStateOnly(String value) {
        return isStateOrCountry(value);
    }

    private static String clean(String value) {
        if (value == null) return "";
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim().replaceAll("\\s+", " ");
    }
}
