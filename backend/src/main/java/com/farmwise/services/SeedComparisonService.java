package com.farmwise.services;

import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.dto.SeedComparisonRequestDTO;
import com.farmwise.dto.SeedComparisonResponseDTO;
import com.farmwise.models.SeedVariety;
import com.farmwise.models.FarmMemoryLog;
import com.farmwise.models.RecommendationHistory;
import com.farmwise.repositories.SeedVarietyRepository;
import com.farmwise.repositories.RecommendationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeedComparisonService {

    @Autowired
    private SeedVarietyRepository seedVarietyRepository;

    @Autowired
    private RecommendationHistoryRepository recommendationHistoryRepository;

    @Autowired
    private FarmProfileService farmProfileService;

    @Autowired
    private FarmMemoryService farmMemoryService;

    public List<SeedVariety> getAllSeedCatalog() {
        return seedVarietyRepository.findAll().stream().filter(this::isPaddySeed).collect(Collectors.toList());
    }

    private boolean isPaddySeed(SeedVariety seed) {
        if (seed == null || seed.getCropType() == null) return false;
        String crop = seed.getCropType().trim();
        return crop.equalsIgnoreCase("Rice/Paddy") || crop.equalsIgnoreCase("Rice") || crop.equalsIgnoreCase("Paddy");
    }

    public SeedComparisonResponseDTO compareSeeds(String farmerId, SeedComparisonRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Please select 2 or 3 seed varieties to compare.");
        }
        List<String> seedIds = request.getSeedIds();
        if (seedIds == null || seedIds.size() < 2 || seedIds.size() > 3) {
            throw new IllegalArgumentException("Must manually select between 2 and 3 seed varieties for comparison.");
        }
        List<String> uniqueIds = seedIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .distinct()
                .collect(Collectors.toList());
        if (uniqueIds.size() != seedIds.size()) {
            throw new IllegalArgumentException("Choose 2 or 3 different seed varieties. Duplicate or empty selections are not allowed.");
        }

        if (farmerId != null) {
            List<RecommendationHistory> history = recommendationHistoryRepository.findByFarmerIdOrderByTimestampDesc(farmerId);
            Set<String> previouslyRecommendedIds = new HashSet<>();
            for (RecommendationHistory run : history) {
                if (run.getRecommendedVarieties() == null) continue;
                run.getRecommendedVarieties().stream()
                        .map(RecommendationHistory.SavedRecommendationItem::getSeedId)
                        .filter(Objects::nonNull)
                        .forEach(previouslyRecommendedIds::add);
            }
            if (previouslyRecommendedIds.isEmpty()) {
                throw new IllegalArgumentException("Generate seed recommendations before comparing varieties.");
            }
            if (!previouslyRecommendedIds.containsAll(uniqueIds)) {
                throw new IllegalArgumentException("Compare only seed varieties recommended for your farm. Refresh your recommendations and select from that list.");
            }
        }

        List<SeedVariety> selectedSeeds = new ArrayList<>();
        for (String id : uniqueIds) {
            Optional<SeedVariety> seedOpt = seedVarietyRepository.findById(id).filter(this::isPaddySeed);
            seedOpt.ifPresent(selectedSeeds::add);
        }

        if (selectedSeeds.size() != uniqueIds.size()) {
            throw new IllegalArgumentException("One or more selected seed varieties could not be found. Refresh the catalog and select valid varieties.");
        }
        if (selectedSeeds.size() < 2) {
            throw new IllegalArgumentException("Could not retrieve at least 2 valid seed varieties from MongoDB. Found " + selectedSeeds.size() + " varieties.");
        }

        // Build meaningful differences
        List<String> meaningfulDifferences = buildMeaningfulDifferences(selectedSeeds);

        // Build trade-offs
        List<String> tradeoffs = buildTradeoffs(selectedSeeds);

        // Determine best choice for the farmer's saved profile
        String bestChoiceId = null;
        String bestChoiceName = null;
        String bestChoiceExplanation = null;
        boolean tieOrInsufficientEvidence = false;
        String tieOrEvidenceExplanation = null;
        Map<String, Object> farmProfileContext = new LinkedHashMap<>();

        if (farmerId != null) {
            Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(farmerId);
            if (profileOpt.isPresent()) {
                FarmProfileDTO profile = profileOpt.get();
                farmProfileContext.put("location", profile.getLocation());
                farmProfileContext.put("soilType", profile.getSoilType());
                farmProfileContext.put("soilPh", profile.getSoilPh());
                farmProfileContext.put("irrigationMethod", profile.getIrrigationMethod());
                farmProfileContext.put("waterAvailability", profile.getWaterAvailability());
                farmProfileContext.put("preferredCrop", profile.getPreferredCrop());
                farmProfileContext.put("growingSeason", profile.getGrowingSeason());

                // Use only this farmer's most recent harvest records with comparable recorded conditions.
                List<FarmMemoryLog> harvestExperiences = farmMemoryService.getFarmerHistoryByType(farmerId, "HARVEST_EXPERIENCE");
                Map<SeedVariety, Integer> seedScores = new LinkedHashMap<>();
                for (SeedVariety s : selectedSeeds) {
                    int score = computeComparisonFitScore(s, profile);
                    String outcome = comparableHarvestOutcome(s, profile, harvestExperiences);
                    if ("GOOD".equals(outcome)) score += 5;
                    else if ("LOW".equals(outcome)) score -= 5;
                    else if ("MODERATE".equals(outcome)) score += 1;
                    seedScores.put(s, Math.max(0, Math.min(100, score)));
                }

                // Sort by score descending
                List<Map.Entry<SeedVariety, Integer>> sortedList = new ArrayList<>(seedScores.entrySet());
                sortedList.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));

                SeedVariety topSeed = sortedList.get(0).getKey();
                int topScore = sortedList.get(0).getValue();
                SeedVariety secondSeed = sortedList.get(1).getKey();
                int secondScore = sortedList.get(1).getValue();

                // Always give the farmer a clear first option based on the rule-based relative fit score.
                // Demonstration data or a small score gap changes the confidence wording, not the ranking.
                int scoreGap = topScore - secondScore;
                boolean demonstrationEvidence = topSeed.isDemonstrationData() || secondSeed.isDemonstrationData();
                bestChoiceId = topSeed.getId();
                bestChoiceName = topSeed.getName();
                if (demonstrationEvidence || scoreGap < 8) {
                    bestChoiceExplanation = topSeed.getName() + " ranks first for the farm details entered. " +
                            "The difference from " + secondSeed.getName() + " is small or some seed details are demonstration data, " +
                            "so treat this as the first option to review and confirm seed details and local price before buying.";
                } else {
                    bestChoiceExplanation = buildBestChoiceExplanation(topSeed, secondSeed, profile, topScore);
                }
                String rememberedOutcome = comparableHarvestOutcome(topSeed, profile, harvestExperiences);
                if (rememberedOutcome != null) {
                    bestChoiceExplanation += " Farm Memory also records a " + rememberedOutcome.toLowerCase(Locale.ROOT) +
                            " harvest for this variety under similar recorded soil, water, and season conditions.";
                }
                tieOrInsufficientEvidence = false;

                // Log comparison activity to Farm Memory
                String comparedNames = selectedSeeds.stream().map(SeedVariety::getName).collect(Collectors.joining(" vs "));
                farmMemoryService.logEvent(
                        farmerId,
                        "SEEDS_COMPARED",
                        "Manual Seed Variety Comparison",
                        "Compared " + selectedSeeds.size() + " varieties (" + comparedNames + ") for farm in " + profile.getLocation(),
                        farmProfileContext
                );
            } else {
                tieOrInsufficientEvidence = true;
                tieOrEvidenceExplanation = "No saved Farm Profile found. Complete your farm profile to view tailored suitability recommendations and trade-off analysis for these selected seeds.";
            }
        }

        return new SeedComparisonResponseDTO(
                selectedSeeds,
                bestChoiceId,
                bestChoiceName,
                bestChoiceExplanation,
                tradeoffs,
                meaningfulDifferences,
                tieOrInsufficientEvidence,
                tieOrEvidenceExplanation,
                farmProfileContext
        );
    }

    private String comparableHarvestOutcome(SeedVariety seed, FarmProfileDTO profile, List<FarmMemoryLog> experiences) {
        for (FarmMemoryLog experience : experiences) {
            Map<String, Object> details = experience.getSnapshotData();
            if (details == null) continue;
            Object rememberedName = details.get("seedName");
            if (rememberedName == null || !seed.getName().equalsIgnoreCase(rememberedName.toString().trim())) continue;
            Object soil = details.get("soilType");
            Object water = details.get("waterAvailability");
            // Prefer the season entered for this harvest; older records may only contain
            // the profile's growingSeason snapshot.
            Object season = details.get("season");
            if (season == null) season = details.get("growingSeason");
            if (soil == null || water == null || season == null) continue;
            boolean comparable = AgronomyMatcher.sameValue(soil.toString(), profile.getSoilType())
                    && AgronomyMatcher.sameValue(water.toString(), profile.getWaterAvailability())
                    && AgronomyMatcher.seasonMatches(profile.getGrowingSeason(), season.toString());
            if (!comparable) continue;
            Object outcome = details.get("harvestOutcome");
            if (outcome != null) {
                String normalized = outcome.toString().trim().toUpperCase(Locale.ROOT);
                if (Set.of("GOOD", "MODERATE", "LOW").contains(normalized)) return normalized;
            }
        }
        return null;
    }

    private boolean isPaddyCrop(String cropType) {
        if (cropType == null) return false;
        String normalized = cropType.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("rice/paddy") || normalized.equals("rice") || normalized.equals("paddy");
    }

    private int computeComparisonFitScore(SeedVariety seed, FarmProfileDTO profile) {
        int score = 40;

        // Preferred crop alignment
        if (isPaddySeed(seed) && isPaddyCrop(profile.getPreferredCrop())) {
            score += 25;
        }

        // Soil pH
        if (seed.getMinPh() != null && seed.getMaxPh() != null) {
            double ph = profile.getSoilPh();
            if (ph >= seed.getMinPh() && ph <= seed.getMaxPh()) {
                score += 15;
            } else if (ph >= (seed.getMinPh() - 0.3) && ph <= (seed.getMaxPh() + 0.3)) {
                score += 5;
            }
        }

        // Soil type
        if (seed.getSuitableSoilTypes() != null &&
                seed.getSuitableSoilTypes().stream().anyMatch(st -> st.equalsIgnoreCase(profile.getSoilType()))) {
            score += 10;
        }

        // Water & drought
        String varietyWater = seed.getWaterRequirements() != null ? seed.getWaterRequirements() : "Moderate";
        String farmWater = profile.getWaterAvailability() != null ? profile.getWaterAvailability() : "Moderate";
        if (varietyWater.equalsIgnoreCase("High") && farmWater.equalsIgnoreCase("Low")) {
            score -= 15;
        } else if ("High".equalsIgnoreCase(seed.getDroughtTolerance()) && farmWater.equalsIgnoreCase("Low")) {
            score += 10;
        } else {
            score += 8;
        }

        // Irrigation
        if (seed.getSuitableIrrigationMethods() != null &&
                seed.getSuitableIrrigationMethods().stream().anyMatch(im -> im.equalsIgnoreCase(profile.getIrrigationMethod()))) {
            score += 5;
        }

        // Season
        if (seed.getGrowingSeasons() != null &&
                seed.getGrowingSeasons().stream().anyMatch(s -> AgronomyMatcher.seasonMatches(profile.getGrowingSeason(), s))) {
            score += 10;
        }

        // This is a relative rule-based fit score, not a probability. Keep the displayed range bounded.
        return Math.max(0, Math.min(100, score));
    }

    private String buildBestChoiceExplanation(SeedVariety top, SeedVariety competitor, FarmProfileDTO profile, int score) {
        StringBuilder sb = new StringBuilder();
        sb.append(top.getName()).append(" is the strongest match for your farm in ").append(profile.getLocation()).append(". ");
        sb.append("Key advantages for your conditions: ");

        if (isPaddySeed(top) && isPaddyCrop(profile.getPreferredCrop())) {
            sb.append("Directly matches your preferred crop category (").append(profile.getPreferredCrop()).append("). ");
        }

        if (top.getSuitableSoilTypes() != null && top.getSuitableSoilTypes().stream().anyMatch(st -> st.equalsIgnoreCase(profile.getSoilType()))) {
            sb.append("The catalog lists ").append(profile.getSoilType()).append(" soil as a match. ");
        }

        if (top.getYieldPotentialQuintalPerAcre() != null && competitor.getYieldPotentialQuintalPerAcre() != null) {
            if (top.getYieldPotentialQuintalPerAcre() > competitor.getYieldPotentialQuintalPerAcre()) {
                sb.append("Higher catalog-listed yield figure (").append(top.getYieldPotentialQuintalPerAcre())
                        .append(" Q/Acre vs ").append(competitor.getYieldPotentialQuintalPerAcre()).append(" Q/Acre). ");
            }
        }

        sb.append("Trade-off to consider: ");
        if (top.getMaturityDays() != null && competitor.getMaturityDays() != null && top.getMaturityDays() > competitor.getMaturityDays()) {
            sb.append("Takes ").append(top.getMaturityDays() - competitor.getMaturityDays())
                    .append(" more days to reach maturity than ").append(competitor.getName()).append(". ");
        } else if (top.getWaterRequirements() != null && top.getWaterRequirements().equalsIgnoreCase("High")) {
            sb.append("Requires higher irrigation water management than other options. ");
        } else if (top.getDisadvantages() != null && !top.getDisadvantages().isEmpty()) {
            sb.append(top.getDisadvantages().get(0)).append(". ");
        } else {
            sb.append("Requires standard local agronomic management practices.");
        }

        return sb.toString();
    }

    private List<String> buildMeaningfulDifferences(List<SeedVariety> seeds) {
        List<String> diffs = new ArrayList<>();

        // Maturity duration comparison
        List<Integer> durations = seeds.stream().map(SeedVariety::getMaturityDays).filter(Objects::nonNull).collect(Collectors.toList());
        if (durations.size() >= 2) {
            int minD = Collections.min(durations);
            int maxD = Collections.max(durations);
            if (maxD != minD) {
                diffs.add("Maturity duration varies by " + (maxD - minD) + " days (" + minD + " days shortest to " + maxD + " days longest)");
            }
        }

        // Water requirement comparison
        Set<String> waters = seeds.stream().map(SeedVariety::getWaterRequirements).filter(Objects::nonNull).collect(Collectors.toSet());
        if (waters.size() > 1) {
            diffs.add("Different water demands: " + String.join(" vs ", waters));
        }

        // Yield potential variance
        List<Double> yields = seeds.stream().map(SeedVariety::getYieldPotentialQuintalPerAcre).filter(Objects::nonNull).collect(Collectors.toList());
        if (yields.size() >= 2) {
            double minY = Collections.min(yields);
            double maxY = Collections.max(yields);
            if (maxY != minY) {
                diffs.add("Documented yield potential spans from " + minY + " to " + maxY + " Quintals / Acre");
            }
        }

        // Price variance
        List<Double> prices = seeds.stream().map(SeedVariety::getPrice).filter(Objects::nonNull).collect(Collectors.toList());
        if (prices.size() >= 2) {
            double minP = Collections.min(prices);
            double maxP = Collections.max(prices);
            if (maxP != minP) {
                diffs.add("Package price variance: ₹" + minP + " to ₹" + maxP);
            }
        }

        return diffs;
    }

    private List<String> buildTradeoffs(List<SeedVariety> seeds) {
        List<String> tradeoffs = new ArrayList<>();

        for (int i = 0; i < seeds.size(); i++) {
            SeedVariety s1 = seeds.get(i);
            for (int j = i + 1; j < seeds.size(); j++) {
                SeedVariety s2 = seeds.get(j);

                // Quick maturity vs yield tradeoff
                if (s1.getMaturityDays() != null && s2.getMaturityDays() != null &&
                        s1.getYieldPotentialQuintalPerAcre() != null && s2.getYieldPotentialQuintalPerAcre() != null) {
                    if (s1.getMaturityDays() < s2.getMaturityDays() && s1.getYieldPotentialQuintalPerAcre() < s2.getYieldPotentialQuintalPerAcre()) {
                        tradeoffs.add(s1.getName() + " matures " + (s2.getMaturityDays() - s1.getMaturityDays()) +
                                " days faster, but has " + String.format(Locale.US, "%.1f", (s2.getYieldPotentialQuintalPerAcre() - s1.getYieldPotentialQuintalPerAcre())) +
                                " Q/Acre lower yield potential compared to " + s2.getName() + ".");
                    } else if (s2.getMaturityDays() < s1.getMaturityDays() && s2.getYieldPotentialQuintalPerAcre() < s1.getYieldPotentialQuintalPerAcre()) {
                        tradeoffs.add(s2.getName() + " matures " + (s1.getMaturityDays() - s2.getMaturityDays()) +
                                " days faster, but has " + String.format(Locale.US, "%.1f", (s1.getYieldPotentialQuintalPerAcre() - s2.getYieldPotentialQuintalPerAcre())) +
                                " Q/Acre lower yield potential compared to " + s1.getName() + ".");
                    }
                }

                // Drought tolerance vs water volume tradeoff
                if ("High".equalsIgnoreCase(s1.getDroughtTolerance()) && !"High".equalsIgnoreCase(s2.getDroughtTolerance())) {
                    tradeoffs.add(s1.getName() + " offers superior drought tolerance under moisture deficits, whereas " +
                            s2.getName() + " requires consistent irrigation scheduling.");
                } else if ("High".equalsIgnoreCase(s2.getDroughtTolerance()) && !"High".equalsIgnoreCase(s1.getDroughtTolerance())) {
                    tradeoffs.add(s2.getName() + " offers superior drought tolerance under moisture deficits, whereas " +
                            s1.getName() + " requires consistent irrigation scheduling.");
                }
            }
        }

        if (tradeoffs.isEmpty()) {
            tradeoffs.add("Selected varieties exhibit comparable operational cycles and input requirements.");
        }

        return tradeoffs;
    }
}
