package com.farmwise.services;

import com.farmwise.models.SeedVariety;
import com.farmwise.repositories.SeedVarietyRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeedCatalogService {

    @Autowired
    private SeedVarietyRepository seedVarietyRepository;

    @PostConstruct
    public void seedInitialCatalog() {
        Set<String> existingNames = seedVarietyRepository.findAll().stream()
                .map(SeedVariety::getName)
                .filter(Objects::nonNull)
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        List<SeedVariety> missingPaddySeeds = buildDemonstrationCatalog().stream()
                .filter(seed -> seed.getName() != null && !existingNames.contains(seed.getName().trim().toLowerCase(Locale.ROOT)))
                .collect(Collectors.toList());
        if (!missingPaddySeeds.isEmpty()) {
            seedVarietyRepository.saveAll(missingPaddySeeds);
        }
    }

    public List<SeedVariety> getAllSeeds() {
        return seedVarietyRepository.findAll().stream()
                .filter(this::isPaddySeed)
                .collect(Collectors.toList());
    }

    public Optional<SeedVariety> getSeedById(String id) {
        return seedVarietyRepository.findById(id).filter(this::isPaddySeed);
    }

    private boolean isPaddySeed(SeedVariety seed) {
        if (seed == null || seed.getCropType() == null) return false;
        String crop = seed.getCropType().trim().toLowerCase(Locale.ROOT);
        return crop.equals("rice/paddy") || crop.equals("paddy") || crop.equals("rice");
    }

    public List<SeedVariety> searchAndFilter(String query, String cropType, String season,
                                              String soilType, String waterReq, String sortBy,
                                              Integer maxDuration, Double maxPrice) {
        List<SeedVariety> results = seedVarietyRepository.findAll().stream().filter(this::isPaddySeed).collect(Collectors.toList());

        // Text search across name, cropType, description, varietyCode
        if (query != null && !query.trim().isEmpty()) {
            String q = query.trim().toLowerCase();
            results = results.stream()
                    .filter(s -> (s.getName() != null && s.getName().toLowerCase().contains(q))
                            || (s.getCropType() != null && s.getCropType().toLowerCase().contains(q))
                            || (s.getVarietyCode() != null && s.getVarietyCode().toLowerCase().contains(q))
                            || (s.getDescription() != null && s.getDescription().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // Filter by crop type
        if (cropType != null && !cropType.trim().isEmpty()) {
            String requestedCrop = cropType.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
            boolean requestsPaddy = requestedCrop.equals("rice") || requestedCrop.equals("paddy")
                    || requestedCrop.equals("rice/paddy") || requestedCrop.equals("paddy/rice")
                    || requestedCrop.equals("rice paddy");
            results = results.stream()
                    .filter(s -> requestsPaddy ? isPaddySeed(s)
                            : s.getCropType() != null && s.getCropType().equalsIgnoreCase(cropType.trim()))
                    .collect(Collectors.toList());
        }

        // Filter by growing season
        if (season != null && !season.trim().isEmpty()) {
            results = results.stream()
                    .filter(s -> s.getGrowingSeasons() != null &&
                            s.getGrowingSeasons().stream().anyMatch(gs -> AgronomyMatcher.seasonMatches(season, gs)))
                    .collect(Collectors.toList());
        }

        // Filter by soil type
        if (soilType != null && !soilType.trim().isEmpty()) {
            results = results.stream()
                    .filter(s -> s.getSuitableSoilTypes() != null &&
                            s.getSuitableSoilTypes().stream().anyMatch(st -> st.equalsIgnoreCase(soilType.trim())))
                    .collect(Collectors.toList());
        }

        // Filter by water requirement
        if (waterReq != null && !waterReq.trim().isEmpty()) {
            results = results.stream()
                    .filter(s -> s.getWaterRequirements() != null &&
                            s.getWaterRequirements().equalsIgnoreCase(waterReq.trim()))
                    .collect(Collectors.toList());
        }

        // Filter by max growing duration
        if (maxDuration != null && maxDuration > 0) {
            results = results.stream()
                    .filter(s -> s.getMaturityDays() != null && s.getMaturityDays() <= maxDuration)
                    .collect(Collectors.toList());
        }

        // Filter by max price
        if (maxPrice != null && maxPrice > 0) {
            results = results.stream()
                    .filter(s -> s.getPrice() != null && s.getPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        // Sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            switch (sortBy.toLowerCase()) {
                case "name":
                    results.sort(Comparator.comparing(SeedVariety::getName, String.CASE_INSENSITIVE_ORDER));
                    break;
                case "price_asc":
                    results.sort(Comparator.comparing(s -> s.getPrice() != null ? s.getPrice() : Double.MAX_VALUE));
                    break;
                case "price_desc":
                    results.sort(Comparator.comparing((SeedVariety s) -> s.getPrice() != null ? s.getPrice() : 0.0).reversed());
                    break;
                case "duration_asc":
                    results.sort(Comparator.comparing(s -> s.getMaturityDays() != null ? s.getMaturityDays() : Integer.MAX_VALUE));
                    break;
                case "duration_desc":
                    results.sort(Comparator.comparing((SeedVariety s) -> s.getMaturityDays() != null ? s.getMaturityDays() : 0).reversed());
                    break;
                case "yield_desc":
                    results.sort(Comparator.comparing((SeedVariety s) -> s.getYieldPotentialQuintalPerAcre() != null ? s.getYieldPotentialQuintalPerAcre() : 0.0).reversed());
                    break;
                default:
                    results.sort(Comparator.comparing(SeedVariety::getName, String.CASE_INSENSITIVE_ORDER));
                    break;
            }
        }

        return results;
    }

    private List<SeedVariety> buildDemonstrationCatalog() {
        List<SeedVariety> seeds = new ArrayList<>();
        String source = "Demonstration catalog data — confirm variety recommendations with the local agricultural extension office before purchase";
        boolean demo = true;

        seeds.add(new SeedVariety(null, "Swarna Rice Paddy 504", "Rice/Paddy", "SRP-504", 5.0, 7.0,
                List.of("Clay", "Loamy", "Peat"), List.of("Flood", "Rainfed"),
                List.of("Eastern India", "Coastal regions", "River deltas"), List.of("Kharif", "Monsoon"),
                "High", 135, 24.0, "Low", "High", 680.0, "10 kg", source, demo,
                List.of("Widely grown lowland rice type"), List.of("May need reliable water supply"),
                "Demonstration record for a Swarna-type rice entry; verify exact seed identity and local suitability."));

        seeds.add(new SeedVariety(null, "Pusa Basmati 1509", "Rice/Paddy", "PB-1509", 6.0, 7.5,
                List.of("Loamy", "Silt", "Clay"), List.of("Flood", "Sprinkler"),
                List.of("Punjab", "Haryana", "Western UP", "North India"), List.of("Kharif", "Monsoon"),
                "High", 120, 20.0, "Low", "Medium", 950.0, "5 kg", source, demo,
                List.of("Aromatic basmati type", "Relatively shorter duration than some traditional basmati types"),
                List.of("Premium-market type; check local demand and water availability"),
                "Demonstration record for Pusa Basmati 1509; verify exact seed identity and local suitability."));

        seeds.add(new SeedVariety(null, "RNR 15048 Telangana Sona", "Rice/Paddy", "RNR-15048", 5.5, 7.5,
                List.of("Clay", "Loamy"), List.of("Flood", "Rainfed"),
                List.of("Telangana", "Andhra Pradesh", "South India"), List.of("Kharif", "Monsoon", "Rabi"),
                "Moderate", 125, 22.0, "Medium", "Medium", 720.0, "10 kg", source, demo,
                List.of("Regionally relevant Telangana rice entry"), List.of("Confirm certified seed availability and season suitability"),
                "Demonstration record for RNR 15048 (Telangana Sona); verify local agronomic guidance."));

        seeds.add(new SeedVariety(null, "MTU 1010 Cottondora Sannalu", "Rice/Paddy", "MTU-1010", 5.5, 7.5,
                List.of("Clay", "Loamy", "Silt"), List.of("Flood", "Rainfed"),
                List.of("Andhra Pradesh", "Telangana", "South India", "Coastal regions"), List.of("Kharif", "Monsoon"),
                "Moderate", 120, 22.0, "Medium", "Medium", 700.0, "10 kg", source, demo,
                List.of("Commonly recognized South Indian rice variety"), List.of("Local performance depends on water, season and management"),
                "Demonstration record for MTU 1010; verify current regional recommendations."));

        seeds.add(new SeedVariety(null, "BPT 5204 Samba Mahsuri", "Rice/Paddy", "BPT-5204", 5.5, 7.5,
                List.of("Clay", "Loamy", "Silt"), List.of("Flood", "Rainfed"),
                List.of("Andhra Pradesh", "Telangana", "Karnataka", "South India"), List.of("Kharif", "Monsoon"),
                "High", 145, 20.0, "Low", "Medium", 760.0, "10 kg", source, demo,
                List.of("Popular fine-grain rice type in parts of South India"), List.of("May need reliable moisture and disease management"),
                "Demonstration record for BPT 5204 (Samba Mahsuri); confirm certified variety details."));

        seeds.add(new SeedVariety(null, "IR 64 Rice", "Rice/Paddy", "IR-64", 5.0, 7.5,
                List.of("Clay", "Loamy", "Silt"), List.of("Flood", "Rainfed"),
                List.of("India", "South Asia", "Tropical regions"), List.of("Kharif", "Monsoon", "Rabi"),
                "Moderate", 120, 20.0, "Medium", "Medium", 650.0, "10 kg", source, demo,
                List.of("Widely known rice variety"), List.of("Use local trial data to check disease and climate fit"),
                "Demonstration catalog entry; check whether IR 64 is recommended in your district."));

        seeds.add(new SeedVariety(null, "PR 126 Rice", "Rice/Paddy", "PR-126", 5.5, 7.5,
                List.of("Loamy", "Clay", "Silt"), List.of("Flood", "Rainfed"),
                List.of("Punjab", "Haryana", "North India"), List.of("Kharif", "Monsoon"),
                "Moderate", 95, 22.0, "Medium", "Medium", 650.0, "10 kg", source, demo,
                List.of("Short-duration rice type used in parts of North India"), List.of("Not automatically suitable outside its recommended zone"),
                "Demonstration record for PR 126; confirm state and season recommendations."));

        seeds.add(new SeedVariety(null, "Sahbhagi Dhan Rice", "Rice/Paddy", "SAHBHAGI-DHAN", 5.0, 7.5,
                List.of("Loamy", "Sandy", "Silt"), List.of("Rainfed"),
                List.of("Eastern India", "Central India", "Rainfed regions"), List.of("Kharif", "Monsoon"),
                "Low", 105, 15.0, "High", "Medium", 620.0, "5 kg", source, demo,
                List.of("Known for drought tolerance"), List.of("Yield depends strongly on rainfall and field conditions"),
                "Demonstration record for Sahbhagi Dhan; confirm suitability with local extension guidance."));

        seeds.add(new SeedVariety(null, "DRR Dhan 42 Rice", "Rice/Paddy", "DRR-DHAN-42", 5.0, 7.5,
                List.of("Clay", "Loamy"), List.of("Flood", "Rainfed"),
                List.of("Telangana", "Andhra Pradesh", "Eastern India", "Central India"), List.of("Kharif", "Monsoon"),
                "Moderate", 125, 20.0, "Medium", "Medium", 700.0, "5 kg", source, demo,
                List.of("Rice variety entry for evaluation in suitable regions"), List.of("Confirm release zone and seed availability"),
                "Demonstration entry; verify the current official variety guide before choosing."));

        seeds.add(new SeedVariety(null, "Pusa Basmati 1121", "Rice/Paddy", "PB-1121", 6.0, 7.5,
                List.of("Loamy", "Silt", "Clay"), List.of("Flood"),
                List.of("Punjab", "Haryana", "Western UP", "North India"), List.of("Kharif", "Monsoon"),
                "High", 140, 18.0, "Low", "Medium", 1000.0, "5 kg", source, demo,
                List.of("Long-grain aromatic basmati type"), List.of("Check longer crop duration and local market suitability"),
                "Demonstration record for Pusa Basmati 1121; verify exact seed and regional advice."));

        seeds.add(new SeedVariety(null, "Jaya Rice", "Rice/Paddy", "JAYA", 5.0, 7.5,
                List.of("Clay", "Loamy"), List.of("Flood", "Rainfed"),
                List.of("India", "South Asia"), List.of("Kharif", "Monsoon"),
                "High", 135, 20.0, "Low", "Medium", 620.0, "10 kg", source, demo,
                List.of("Established rice variety name for catalog comparison"), List.of("Check whether current local recommendations include this variety"),
                "Demonstration catalog entry; local availability and suitability are not verified."));

        seeds.add(new SeedVariety(null, "CR Dhan 310 Rice", "Rice/Paddy", "CR-DHAN-310", 5.0, 7.5,
                List.of("Loamy", "Sandy", "Silt"), List.of("Rainfed"),
                List.of("Eastern India", "Coastal regions"), List.of("Kharif", "Monsoon"),
                "Low", 115, 17.0, "High", "Medium", 600.0, "5 kg", source, demo,
                List.of("Included for comparing lower-water/rainfed options"), List.of("Verify exact variety traits and recommended region"),
                "Demonstration entry; consult official crop guidance for verified characteristics."));

        seeds.add(new SeedVariety(null, "ADT 43 Rice", "Rice/Paddy", "ADT-43", 5.0, 7.5,
                List.of("Clay", "Loamy", "Silt"), List.of("Flood", "Rainfed"),
                List.of("Tamil Nadu", "South India"), List.of("Kharif", "Monsoon", "Rabi"),
                "Moderate", 110, 19.0, "Medium", "Medium", 640.0, "10 kg", source, demo,
                List.of("Regional comparison option for South India"), List.of("Check district, season and certified seed availability"),
                "Demonstration entry; verify the current Tamil Nadu agricultural recommendation."));

        return seeds;
    }

}
