package com.codementor.dto.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This DTO is used for creating new entities (POST requests)
 */
@Data
public class CreateNoteRequest {
    
    @NotBlank(message = "Name is required")
    private String noteTitle;
    
    private String description;
    
    
} 