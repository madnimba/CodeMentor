package com.codementor.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private Integer jobRoleId;
    private String themePreference;
    private String languagePreference;
    private Boolean isAdmin;
} 