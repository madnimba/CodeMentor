package com.codementor.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Difficulty is required")
    private String difficulty; // Easy, Medium, Hard

    private String importanceTag;

    @NotNull(message = "Track ID is required")
    private Integer trackId;

    private Integer subtopicId;

    private Integer companyId;

    private Boolean isCoding = false;

    private Short year = 2024;

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