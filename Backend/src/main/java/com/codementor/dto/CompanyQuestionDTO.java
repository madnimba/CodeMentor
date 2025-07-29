package com.codementor.dto;

import lombok.Data;

@Data
public class CompanyQuestionDTO {
    private Integer id;
    private String title;
    private String description;
    private String difficulty;
    private String status;
    private String[] tags;
    private String solution;
    private Short question_year;
    private String position;
    private Boolean isCoding;
    private Boolean isCompleted; // Whether the current user has completed this question
}