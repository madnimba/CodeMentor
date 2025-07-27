package com.codementor.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class CreateCompanyRequest {
    @NotBlank(message = "Company name is required")
    private String name;
    
    private String logoUrl;
    private String country;
    private String description;
} 