package com.codementor.dto.admin;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Integer id;
    private String email;
    private String username;
    private LocalDateTime createdAt;
    private String jobRole;
    private String themePreference;
    private String languagePreference;
    private Boolean isAdmin;
} 