package com.codementor.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class UpdateUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Username is required")
    private String username;
    
    private Integer jobRoleId;
    private String themePreference;
    private String languagePreference;
    private Boolean isAdmin;
} 