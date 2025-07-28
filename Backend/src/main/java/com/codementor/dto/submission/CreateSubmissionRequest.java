package com.codementor.dto.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSubmissionRequest {
    
    @NotNull(message = "Question ID is required")
    private Integer questionId;
    
    @NotBlank(message = "Code is required")
    private String code;
    
    @NotBlank(message = "Language is required")
    private String language;
    
    @NotBlank(message = "Status is required")
    private String status; // "accepted" or "rejected"
    
    private Double runtime;
    private Double memory;

} 