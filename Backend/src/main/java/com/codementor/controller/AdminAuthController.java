package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.dto.JwtResponse;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> adminSignIn(@RequestBody AuthRequest request) {
        try {
            String token = adminAuthService.adminSignIn(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success(new JwtResponse(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<ApiResponse<Void>> adminSignOut(@RequestHeader("Authorization") String token) {
        adminAuthService.adminSignOut(token.replace("Bearer ", ""));
        return ResponseEntity.ok(ApiResponse.success("Admin signed out successfully", null));
    }
} 