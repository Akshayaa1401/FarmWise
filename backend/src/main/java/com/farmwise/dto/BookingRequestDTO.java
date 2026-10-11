package com.farmwise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookingRequestDTO {

    @NotBlank(message = "Inventory item ID is required")
    private String inventoryItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Reservation quantity must be at least 1")
    private Integer quantity;

    public BookingRequestDTO() {}

    public BookingRequestDTO(String inventoryItemId, Integer quantity) {
        this.inventoryItemId = inventoryItemId;
        this.quantity = quantity;
    }

    public String getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(String inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
