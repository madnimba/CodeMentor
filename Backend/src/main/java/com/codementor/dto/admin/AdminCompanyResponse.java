package com.codementor.dto.admin;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class AdminCompanyResponse {
    private Integer id;
    private String name;
    private String logoUrl;
    private String country;
    private String description;
    private Integer questionCount;
} 