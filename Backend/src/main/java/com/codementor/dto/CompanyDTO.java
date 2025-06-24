package com.codementor.dto;

import lombok.Data;

@Data
public class CompanyDTO {
    private Integer id;
    private String name;
    private String logoUrl;
    private String country;
    private String description;
    private int totalQuestions;
    private int solvedQuestions;
}