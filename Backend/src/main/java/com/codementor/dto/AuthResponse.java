package com.codementor.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String access_token;
    private String refresh_token;
    private String expires_in;
    private String token_type;
    private User user;
    
    @Data
    public static class User {
        private String id;
        private String email;
        private String phone;
        private String created_at;
        private String updated_at;
    }
} 