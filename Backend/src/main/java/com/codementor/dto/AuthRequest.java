package com.codementor.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String phone;
    private String data;
} 