package com.farmwise.services;

import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.dto.RecommendationResponseDTO;
import com.farmwise.models.RecommendationHistory;
import com.farmwise.models.FarmMemoryLog;
import com.farmwise.models.SeedVariety;
import com.farmwise.repositories.RecommendationHistoryRepository;
import com.farmwise.repositories.SeedVarietyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private FarmProfileService farmProfileService;

    @Autowired
    private SeedVarietyRepository seedVarietyRepository;

    @Autowired
    private RecommendationHistoryRepository recommendationHistoryRepository;

    @Autowired
    private FarmMemoryService farmMemoryService;

    public RecommendationResponseDTO generateRecommendations(String farmerId) {
        Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(farmerId);

        if (profileOpt.isEmpty()) {
            return new RecommendationResponseDTO(
                    "PROFILE_REQUIRED",
                    "Please complete your Farm Profile first to receive personalized seed recommendations.",
                    new ArrayList<>()
            );
        }

        FarmProfileDTO profile = profileOpt.get();
        List<SeedVariety> allSeeds = seedVarietyRepository.findAll().stream()
                .filter(Objects::nonNull)
                .filter(seed -> isPaddyCrop(seed.getCropType()))
                .filter(seed -> seed.getName() != null && !seed.getName().isBlank())
                .collect(Collectors.toMap(
                        seed -> seed.getName().trim().toLowerCase(Locale.ROOT),
                        seed -> seed,
                        (first, duplicate) -> first,
                        LinkedHashMap::new))
                .values().stream()
                .collect(Collectors.toList());

        if (allSeeds.isEmpty()) {
            return new RecommendationResponseDTO(
                    "NO_SEEDS",
                    "No seed varieties found in the catalog. Please ensure the seed database is populated.",
                    new ArrayList<>()
            );
        }

        List<FarmMemoryLog> harvestExperiences = farmMemoryService.getFarmerHistoryByType(farmerId, "HARVEST_EXPERIENCE");
        List<RecommendationResponseDTO.RecommendedSeedItem> evaluatedSeeds = new ArrayList<>();

        for (SeedVariety seed : allSeeds) {
            RecommendationResponseDTO.RecommendedSeedItem item = evaluateSeedSuitability(seed, profile, harvestExperiences);
            evaluatedSeeds.add(item);
        }

        // Sort descending by relative match score
        evaluatedSeeds.sort(Comparator.comparingInt(RecommendationResponseDTO.RecommendedSeedItem::getMatchScore).reversed()
                .thenComparing(item -> item.getSeed().getName(), String.CASE_INSENSITIVE_ORDER));

        // Keep recommendations focused on the four highest-ranked eligible varieties.
        // Persist and return the same shortlist so comparison can only use this run's results.
        List<RecommendationResponseDTO.RecommendedSeedItem> rankedRecommendations = evaluatedSeeds.stream()
                .limit(4)
                .collect(Collectors.toList());

        // Snapshot conditions
        Map<String, Object> profileConditions = new LinkedHashMap<>();
        profileConditions.put("location", profile.getLocation());
        profileConditions.put("farmAreaAcres", profile.getFarmAreaAcres());
        profileConditions.put("soilType", profile.getSoilType());
        profileConditions.put("soilPh", profile.getSoilPh());
        profileConditions.put("irrigationMethod", profile.getIrrigationMethod());
        profileConditions.put("waterAvailability", profile.getWaterAvailability());
        profileConditions.put("preferredCrop", profile.getPreferredCrop());
        profileConditions.put("growingSeason", profile.getGrowingSeason());

        // Prepare saved entities for MongoDB
        List<RecommendationHistory.SavedRecommendationItem> savedItems = rankedRecommendations.stream()
                .map(item -> new RecommendationHistory.SavedRecommendationItem(
                        item.getSeed().getId(),
                        item.getSeed().getName(),
                        item.getSeed().getCropType(),
                        item.getSeed().getVarietyCode(),
                        item.getMatchScore(),
                        item.getMatchReasons(),
                        item.getMismatches(),
                        item.getSoilSuitability(),
                        item.getWaterSuitability(),
                        item.getMaturityDays(),
                        item.getSeed().getYieldPotentialQuintalPerAcre(),
                        item.getLimitations(),
                        item.getSeed().getAgronomicSource(),
                        item.getSeed().isDemonstrationData()
                ))
                .collect(Collectors.toList());

        // Persist to recommendation_history
        RecommendationHistory history = new RecommendationHistory(farmerId, profileConditions, savedItems);
        RecommendationHistory savedHistory = recommendationHistoryRepository.save(history);

        // Also persist audit log to Farm Memory
        String topSeedsSummary = rankedRecommendations.stream()
                .map(r -> r.getSeed().getName() + " (" + r.getMatchScore() + "/100 relative score)")
                .collect(Collectors.joining(", "));

        farmMemoryService.logEvent(
                farmerId,
                "RECOMMENDATIONS_GENERATED",
                "Personalized Seed Recommendations Generated",
                "Evaluated " + allSeeds.size() + " catalog varieties for " + profile.getPreferredCrop() +
                        " in " + profile.getLocation() + ". Ranked matches: " + topSeedsSummary,
                profileConditions
        );

        return new RecommendationResponseDTO(
                "SUCCESS",
                "Showing up to " + rankedRecommendations.size() + " of the most suitable paddy seed varieties for " + profile.getPreferredCrop() + ", ranked using farm conditions and comparable Farm Memory records where available.",
                savedHistory.getId(),
                profileConditions,
                rankedRecommendations
        );
    }

    private RecommendationResponseDTO.RecommendedSeedItem evaluateSeedSuitability(SeedVariety seed, FarmProfileDTO profile, List<FarmMemoryLog> harvestExperiences) {
        int score = 20; // Base score leaves room for profile-specific factors without saturating every variety at 98.
        List<String> matchReasons = new ArrayList<>();
        List<String> mismatches = new ArrayList<>();
        List<String> limitations = new ArrayList<>();

        // Personal history is used only when the same variety was grown under comparable recorded conditions.
        boolean matchingHistoryFound = false;
        boolean sameVarietyNotComparable = false;
        for (FarmMemoryLog experience : harvestExperiences) {
            Map<String, Object> details = experience.getSnapshotData();
            if (details == null) continue;
            Object rememberedName = details.get("seedName");
            if (rememberedName == null || !sameSeedName(seed.getName(), rememberedName.toString())) continue;
            if (!hasComparableFarmContext(details, profile)) {
                sameVarietyNotComparable = true;
                continue;
            }
            matchingHistoryFound = true;
            Object rememberedOutcome = details.get("harvestOutcome");
            String outcome = rememberedOutcome == null ? "" : rememberedOutcome.toString();
            if (outcome.equalsIgnoreCase("GOOD")) {
                score += 10;
                matchReasons.add("Your past harvest for this variety was good under similar recorded farm conditions.");
            } else if (outcome.equalsIgnoreCase("LOW")) {
                score -= 10;
                mismatches.add("Your past harvest for this variety was low under similar recorded farm conditions.");
            } else if (outcome.equalsIgnoreCase("MODERATE")) {
                score += 2;
                matchReasons.add("Your past harvest for this variety was moderate under similar recorded farm conditions.");
            }
            break; // Use the newest comparable record only.
        }
        if (!matchingHistoryFound && sameVarietyNotComparable) {
            limitations.add("A past record exists for this variety, but its recorded conditions differ from your current profile or are incomplete, so it was not used to adjust this ranking.");
        }

        // 1. Preferred Crop match (+25)
        if (isPaddyCrop(seed.getCropType()) && isPaddyCrop(profile.getPreferredCrop())) {
            score += 10;
            matchReasons.add("Directly matches farmer's preferred crop category: " + profile.getPreferredCrop());
        } else {
            mismatches.add("Different crop category (" + seed.getCropType() + " vs requested " + profile.getPreferredCrop() + ")");
        }

        // 2. Soil pH compatibility (+15 or penalty)
        double farmPh = profile.getSoilPh();
        if (seed.getMinPh() != null && seed.getMaxPh() != null) {
            if (farmPh >= seed.getMinPh() && farmPh <= seed.getMaxPh()) {
                score += 15;
                matchReasons.add("Farm soil pH " + farmPh + " is well within optimal variety range (" + seed.getMinPh() + " - " + seed.getMaxPh() + ")");
            } else if (farmPh >= (seed.getMinPh() - 0.4) && farmPh <= (seed.getMaxPh() + 0.4)) {
                score += 5;
                mismatches.add("Soil pH " + farmPh + " is slightly outside optimal range (" + seed.getMinPh() + " - " + seed.getMaxPh() + "). Micronutrient availability adjustments may be needed.");
            } else {
                score -= 10;
                mismatches.add("Significant pH discrepancy: Farm pH is " + farmPh + ", while variety thrives between " + seed.getMinPh() + " and " + seed.getMaxPh() + ".");
            }
        } else {
            limitations.add("No certified soil pH trial thresholds recorded for this variety.");
        }

        // 3. Soil Type Suitability (+10)
        String soilSuitabilityText;
        if (seed.getSuitableSoilTypes() != null &&
                seed.getSuitableSoilTypes().stream().anyMatch(st -> st.equalsIgnoreCase(profile.getSoilType()))) {
            score += 10;
            matchReasons.add("Naturally suited to " + profile.getSoilType() + " soil texture.");
            soilSuitabilityText = seed.isDemonstrationData()
                    ? "Demo catalog lists this variety for " + profile.getSoilType() + " soil; verify locally."
                    : "Catalog lists this variety for " + profile.getSoilType() + " soil.";
        } else {
            score -= 8;
            soilSuitabilityText = "Lower documented fit: " + profile.getSoilType() + " is outside the documented primary soil types for this variety.";
            mismatches.add("Primary trials conducted in " + (seed.getSuitableSoilTypes() != null ? String.join(", ", seed.getSuitableSoilTypes()) : "other") + " rather than " + profile.getSoilType() + ". A suitability penalty was applied.");
        }

        // 4. Water Availability & Irrigation Suitability (+10 or penalty)
        String waterSuitabilityText;
        String varietyWater = seed.getWaterRequirements() != null ? seed.getWaterRequirements().trim() : "Moderate";
        String farmWater = profile.getWaterAvailability() != null ? profile.getWaterAvailability().trim() : "Moderate";

        if (varietyWater.equalsIgnoreCase("High") && (farmWater.equalsIgnoreCase("Low") || farmWater.equalsIgnoreCase("Seasonal"))) {
            score -= farmWater.equalsIgnoreCase("Low") ? 15 : 10;
            mismatches.add("Water deficit risk: High water requirement variety under " + farmWater + " water availability.");
            waterSuitabilityText = "Suboptimal: Requires sustained water supply. Water-stress risk is elevated under " + farmWater.toLowerCase(Locale.ROOT) + " availability.";
        } else if (seed.getDroughtTolerance() != null && seed.getDroughtTolerance().equalsIgnoreCase("High") && (farmWater.equalsIgnoreCase("Low") || farmWater.equalsIgnoreCase("Seasonal"))) {
            score += 10;
            matchReasons.add("Strong drought tolerance compensates for lower farm water availability.");
            waterSuitabilityText = seed.isDemonstrationData()
                    ? "Demo catalog lists high drought tolerance; verify this with an official variety guide."
                    : "Catalog lists high drought tolerance; confirm local suitability.";
        } else {
            score += 8;
            matchReasons.add("Water demand (" + varietyWater + ") aligns reasonably with " + farmWater + " water availability.");
            waterSuitabilityText = "Compatible: Matches farm's " + farmWater + " water availability.";
        }

        // Irrigation method compatibility
        if (seed.getSuitableIrrigationMethods() != null &&
                seed.getSuitableIrrigationMethods().stream().anyMatch(im -> im.equalsIgnoreCase(profile.getIrrigationMethod()))) {
            score += 5;
            matchReasons.add("Compatible with farm's " + profile.getIrrigationMethod() + " irrigation infrastructure.");
        } else if (seed.getSuitableIrrigationMethods() != null && !seed.getSuitableIrrigationMethods().isEmpty()) {
            score -= 4;
            mismatches.add("The catalog does not list the farm's " + profile.getIrrigationMethod() + " irrigation method for this variety.");
        }

        // 5. Growing Season match (+10)
        if (seed.getGrowingSeasons() != null) {
            boolean seasonMatch = seed.getGrowingSeasons().stream()
                    .anyMatch(s -> AgronomyMatcher.seasonMatches(profile.getGrowingSeason(), s));
            if (seasonMatch) {
                score += 10;
                matchReasons.add("Adapted to target " + profile.getGrowingSeason() + " growing season.");
            } else {
                score -= 8;
                mismatches.add("Documented primary seasons (" + String.join(", ", seed.getGrowingSeasons()) + ") do not include " + profile.getGrowingSeason() + ". A season suitability penalty was applied.");
            }
        }

        // 6. Region / Location check. Match against individual saved location components so a
        // village name does not accidentally suppress a catalog region such as Telangana.
        if (seed.getSuitableRegions() != null && !seed.getSuitableRegions().isEmpty() && profile.getLocation() != null) {
            List<String> locationParts = Arrays.stream(profile.getLocation().split("[,;/]") )
                    .map(String::trim).filter(part -> !part.isEmpty()).toList();
            boolean regionMatch = seed.getSuitableRegions().stream().anyMatch(region ->
                    locationParts.stream().anyMatch(part -> part.equalsIgnoreCase(region)
                            || part.toLowerCase(Locale.ROOT).contains(region.toLowerCase(Locale.ROOT))
                            || region.toLowerCase(Locale.ROOT).contains(part.toLowerCase(Locale.ROOT))));
            if (regionMatch) {
                score += 8;
                matchReasons.add("The saved farm location matches a catalog-listed region for this variety; confirm suitability with local agricultural guidance.");
            } else if (locationParts.size() >= 2) {
                score -= 5;
                mismatches.add("The saved location does not match the variety's listed regions (" + String.join(", ", seed.getSuitableRegions()) + "). Verify regional suitability before choosing this variety.");
            } else {
                limitations.add("The saved location contains only a locality name, so regional suitability could not be confirmed from the catalog.");
            }
        }

        // 7. Limitations & Demonstration notice
        if (seed.isDemonstrationData()) {
            limitations.add("Demonstration seed record: Local agricultural research station trials should verify commercial field performance.");
        }
        if (seed.getYieldPotentialQuintalPerAcre() == null) {
            limitations.add("Yield potential data is pending official multi-season trial publication.");
        }
        if (seed.getPrice() == null) {
            limitations.add("Commercial retail pricing not verified; contact certified local seed distributors.");
        }

        // Normalize score between 25 and 98
        int finalScore = Math.max(25, Math.min(score, 98));
        String scoreExplanation = "Relative suitability ranking score (" + finalScore + "/100) calculated via transparent deterministic agronomic rules. Not a probability of success or guaranteed yield.";

        return new RecommendationResponseDTO.RecommendedSeedItem(
                seed,
                finalScore,
                scoreExplanation,
                matchReasons,
                mismatches,
                soilSuitabilityText,
                waterSuitabilityText,
                seed.getMaturityDays(),
                limitations
        );
    }


    /**
     * Matches farmer-entered seed names to catalog names while ignoring common descriptive
     * words (for example, "Jaya" and "Jaya Rice"). This avoids losing Farm Memory evidence
     * when the saved name and catalog display name differ only by a generic crop label.
     */
    private boolean sameSeedName(String catalogName, String rememberedName) {
        return !normalizeSeedName(catalogName).isEmpty()
                && normalizeSeedName(catalogName).equals(normalizeSeedName(rememberedName));
    }

    private String normalizeSeedName(String name) {
        if (name == null) return "";
        String normalized = name.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
        Set<String> genericWords = Set.of("rice", "paddy", "seed", "seeds", "variety", "varieties", "crop");
        return Arrays.stream(normalized.split(" "))
                .filter(token -> !genericWords.contains(token))
                .collect(Collectors.joining(" "));
    }

    private boolean hasComparableFarmContext(Map<String, Object> details, FarmProfileDTO profile) {
        // Legacy records without conditions are intentionally not treated as comparable evidence.
        Object soil = details.get("soilType");
        Object water = details.get("waterAvailability");
        // The harvest form records the season the crop was actually grown in. Older records
        // may only have the profile's growingSeason snapshot, so retain that as a fallback.
        Object season = details.get("season");
        if (season == null) season = details.get("growingSeason");
        if (soil == null || water == null || season == null) return false;
        return AgronomyMatcher.sameValue(soil.toString(), profile.getSoilType())
                && AgronomyMatcher.sameValue(water.toString(), profile.getWaterAvailability())
                && AgronomyMatcher.seasonMatches(profile.getGrowingSeason(), season.toString());
    }

    private boolean isPaddyCrop(String cropType) {
        if (cropType == null) return false;
        String normalized = cropType.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        return normalized.equals("rice/paddy") || normalized.equals("rice") || normalized.equals("paddy")
                || normalized.equals("paddy/rice") || normalized.equals("rice paddy");
    }

    public List<RecommendationHistory> getRecommendationHistory(String farmerId) {
        return recommendationHistoryRepository.findByFarmerIdOrderByTimestampDesc(farmerId);
    }

    public Optional<RecommendationHistory> getRecommendationHistoryById(String id) {
        return recommendationHistoryRepository.findById(id);
    }
}
