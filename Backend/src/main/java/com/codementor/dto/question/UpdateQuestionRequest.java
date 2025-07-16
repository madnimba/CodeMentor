package com.codementor.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateQuestionRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Content fingerprint is required")
    private String contentFingerprint;
    
    @NotNull(message = "Difficulty is required")
    private String difficulty;
    
    private String importanceTag;
    
    @NotNull(message = "Track ID is required")
    private Integer trackId;
    
    private Integer subtopicId;
} 