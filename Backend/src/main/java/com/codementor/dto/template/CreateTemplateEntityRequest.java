package com.codementor.dto.template;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This DTO is used for creating new entities (POST requests)
 */
@Data
public class CreateTemplateEntityRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Status is required")
    private TemplateEntityStatus status;
    
    private Boolean isActive = true;
    
    // Example enum for request
    public enum TemplateEntityStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
} 