package com.codementor.dto;

import lombok.Data;

@Data
public class CompanyStatsDTO {
    private Integer id;
    private String name;
    private String logoUrl;
    private String country;
    private String description;
    private Integer totalQuestions;
    private Integer solvedQuestions;
    private Double progressPercentage;
} 