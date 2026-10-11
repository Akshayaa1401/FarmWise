package com.farmwise.services;

import java.util.Locale;

/** Normalizes common farmer-friendly labels before matching catalog values. */
public final class AgronomyMatcher {
    private AgronomyMatcher() {}

    public static String season(String value) {
        if (value == null) return "";
        String v = value.trim().toLowerCase(Locale.ROOT);
        if (v.contains("kharif") || v.contains("monsoon") || v.contains("rainy")) return "kharif";
        if (v.contains("rabi") || v.contains("winter")) return "rabi";
        if (v.contains("zaid") || v.contains("summer")) return "zaid";
        if (v.contains("year-round") || v.contains("year round") || v.contains("all season")) return "year-round";
        return v;
    }

    public static boolean seasonMatches(String farmSeason, String catalogSeason) {
        String farm = season(farmSeason);
        String catalog = season(catalogSeason);
        return !farm.isBlank() && (catalog.equals("year-round") || farm.equals(catalog));
    }

    public static String value(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean sameValue(String a, String b) {
        return !value(a).isBlank() && value(a).equals(value(b));
    }
}
