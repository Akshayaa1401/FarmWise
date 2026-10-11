package com.farmwise.services;

import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.models.FarmProfile;
import com.farmwise.repositories.FarmProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FarmProfileService {

    @Autowired
    private FarmProfileRepository farmProfileRepository;

    @Autowired
    private FarmMemoryService farmMemoryService;

    public Optional<FarmProfileDTO> getProfileByFarmerId(String farmerId) {
        return farmProfileRepository.findByFarmerId(farmerId)
                .map(this::mapToDTO);
    }

    public FarmProfileDTO saveOrUpdateProfile(String farmerId, FarmProfileDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Farm profile details are required.");
        }
        if (isBlank(dto.getLocation()) || isBlank(dto.getSoilType()) || isBlank(dto.getIrrigationMethod())
                || isBlank(dto.getWaterAvailability()) || isBlank(dto.getGrowingSeason())) {
            throw new IllegalArgumentException("Location, soil type, irrigation method, water availability, and growing season are required.");
        }
        if (dto.getFarmAreaAcres() == null || !Double.isFinite(dto.getFarmAreaAcres()) || dto.getFarmAreaAcres() <= 0) {
            throw new IllegalArgumentException("Farm area must be a positive number.");
        }
        if (dto.getSoilPh() == null || !Double.isFinite(dto.getSoilPh()) || dto.getSoilPh() < 3.0 || dto.getSoilPh() > 10.0) {
            throw new IllegalArgumentException("Soil pH must be between 3.0 and 10.0.");
        }
        if (dto.getPreferredCrop() == null || !(dto.getPreferredCrop().equalsIgnoreCase("Rice/Paddy")
                || dto.getPreferredCrop().equalsIgnoreCase("Rice") || dto.getPreferredCrop().equalsIgnoreCase("Paddy"))) {
            throw new IllegalArgumentException("FarmWise currently supports paddy/rice seed varieties only.");
        }
        dto.setPreferredCrop("Rice/Paddy");
        Optional<FarmProfile> existingOpt = farmProfileRepository.findByFarmerId(farmerId);

        boolean isUpdate = existingOpt.isPresent();
        FarmProfile profile;
        if (isUpdate) {
            profile = existingOpt.get();
        } else {
            profile = new FarmProfile();
            profile.setFarmerId(farmerId);
        }

        profile.setLocation(dto.getLocation().trim());
        profile.setFarmAreaAcres(dto.getFarmAreaAcres());
        profile.setSoilType(dto.getSoilType().trim());
        profile.setSoilPh(dto.getSoilPh());
        profile.setIrrigationMethod(dto.getIrrigationMethod().trim());
        profile.setWaterAvailability(dto.getWaterAvailability().trim());
        profile.setPreferredCrop(dto.getPreferredCrop().trim());
        profile.setGrowingSeason(dto.getGrowingSeason().trim());
        profile.setUpdatedAt(Instant.now());

        FarmProfile saved = farmProfileRepository.save(profile);

        // Log event to Farm Memory
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("location", saved.getLocation());
        snapshot.put("farmAreaAcres", saved.getFarmAreaAcres());
        snapshot.put("soilType", saved.getSoilType());
        snapshot.put("soilPh", saved.getSoilPh());
        snapshot.put("irrigationMethod", saved.getIrrigationMethod());
        snapshot.put("waterAvailability", saved.getWaterAvailability());
        snapshot.put("preferredCrop", saved.getPreferredCrop());
        snapshot.put("growingSeason", saved.getGrowingSeason());

        String actionType = isUpdate ? "PROFILE_UPDATED" : "PROFILE_CREATED";
        String title = isUpdate ? "Farm Profile Updated" : "Farm Profile Created";
        String summary = saved.getLocation() + " — " + saved.getFarmAreaAcres() + " acres, "
                + saved.getSoilType() + " soil (pH " + saved.getSoilPh() + "), "
                + saved.getPreferredCrop() + " (" + saved.getGrowingSeason() + ")";

        farmMemoryService.logEvent(farmerId, actionType, title, summary, snapshot);

        return mapToDTO(saved);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private FarmProfileDTO mapToDTO(FarmProfile profile) {
        FarmProfileDTO dto = new FarmProfileDTO();
        dto.setId(profile.getId());
        dto.setLocation(profile.getLocation());
        dto.setFarmAreaAcres(profile.getFarmAreaAcres());
        dto.setSoilType(profile.getSoilType());
        dto.setSoilPh(profile.getSoilPh());
        dto.setIrrigationMethod(profile.getIrrigationMethod());
        dto.setWaterAvailability(profile.getWaterAvailability());
        dto.setPreferredCrop("Rice/Paddy");
        dto.setGrowingSeason(profile.getGrowingSeason());
        return dto;
    }
}
