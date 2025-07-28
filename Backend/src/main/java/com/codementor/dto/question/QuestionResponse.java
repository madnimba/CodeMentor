package com.codementor.dto.question;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuestionResponse {
    private Integer id;
    private String title;
    private String slug;
    private String description;
    private String difficulty;
    private String importanceTag;
    private Integer trackId;
    private String trackName;
    private Integer subtopicId;
    private String subtopicName;
    private Integer createdById;
    private String createdByUsername;
    private Integer upvotes;
    private Integer downvotes;
    private Boolean isApproved;
    private Boolean isCoding;
    private LocalDateTime createdAt;
    private List<TestcaseResponse> testcases;

    @Data
    public static class TestcaseResponse {
        private Integer id;
        private String test1;
        private String output1;
        private String test2;
        private String output2;
        private String test3;
        private String output3;
    }
} 