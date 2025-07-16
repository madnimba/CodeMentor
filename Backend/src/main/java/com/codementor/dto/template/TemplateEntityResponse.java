package com.codementor.dto.template;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This DTO is used for returning entity data (GET requests)
 */
@Data
public class TemplateEntityResponse {
    
    private Integer id;
    private String name;
    private String description;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related entity information
    private Integer createdById;
    private String createdByUsername;
    
    // Additional computed fields can be added here
    private String displayName; // Example: computed field
} 