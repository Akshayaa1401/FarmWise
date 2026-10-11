package com.farmwise.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class SeedComparisonRequestDTO {

    @NotEmpty(message = "Please select seeds to compare")
    @Size(min = 2, max = 3, message = "Select between 2 and 3 seed varieties to compare")
    private List<String> seedIds;

    public SeedComparisonRequestDTO() {}

    public SeedComparisonRequestDTO(List<String> seedIds) {
        this.seedIds = seedIds;
    }

    public List<String> getSeedIds() {
        return seedIds;
    }

    public void setSeedIds(List<String> seedIds) {
        this.seedIds = seedIds;
    }
}
