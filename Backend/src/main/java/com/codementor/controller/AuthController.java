package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/test")
    public String test() {
        return "Backend is up!";
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody AuthRequest request) {
        String token = authService.signUp(request.getEmail(), request.getUsername(), request.getPassword());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/signin")
    public ResponseEntity<String> signIn(@RequestBody AuthRequest request) {
        String token = authService.signIn(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/signout")
    public ResponseEntity<Void> signOut(@RequestHeader("Authorization") String token) {
        authService.signOut(token.replace("Bearer ", ""));
        return ResponseEntity.ok().build();
    }
} 