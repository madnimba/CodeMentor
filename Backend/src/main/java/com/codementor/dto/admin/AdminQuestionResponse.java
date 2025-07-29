package com.codementor.dto.admin;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminQuestionResponse {
    private Integer id;
    private String title;
    private String description;
    private String difficulty;
    private String importanceTag;
    private String track;
    private String subtopic;
    private String createdBy;
    private Boolean isApproved;
    private Boolean isCoding;
    private LocalDateTime createdAt;
    private Integer testcaseCount;
    private Integer solutionCount;
    private List<String> companies;
    private Short question_year;
} 