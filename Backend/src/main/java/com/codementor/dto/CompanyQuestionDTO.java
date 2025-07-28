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
    private Integer year;
    private String position;
    private Boolean isCoding;
}