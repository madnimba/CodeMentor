package com.codementor.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class UpdateQuestionRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    
    private String importanceTag;
    
    @NotNull(message = "Track ID is required")
    private Integer trackId;
    
    private Integer subtopicId;
    private Boolean isApproved;
    private List<TestcaseRequest> testcases;
    
    @Data
    public static class TestcaseRequest {
        private String input;
        private String expectedOutput;
        private Integer timeLimitMs;
        private Boolean isPublic;
    }
} 