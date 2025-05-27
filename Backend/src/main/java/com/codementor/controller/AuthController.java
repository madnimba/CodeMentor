package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Your frontend URL
public class AuthController {

    @Autowired
    private AuthService authService;

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