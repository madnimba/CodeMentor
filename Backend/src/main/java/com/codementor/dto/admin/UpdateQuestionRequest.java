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
    private Boolean isCoding;
    private Short year;
    private List<TestcaseRequest> testcases;
    
    @Data
    public static class TestcaseRequest {
        private String test1;
        private String output1;
        private String test2;
        private String output2;
        private String test3;
        private String output3;
    }
} 