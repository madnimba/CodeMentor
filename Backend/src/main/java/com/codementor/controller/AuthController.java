package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.dto.AuthResponse;
import com.codementor.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Your frontend URL
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public Mono<ResponseEntity<AuthResponse>> signUp(@RequestBody AuthRequest request) {
        return authService.signUp(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PostMapping("/signin")
    public Mono<ResponseEntity<AuthResponse>> signIn(@RequestBody AuthRequest request) {
        return authService.signIn(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PostMapping("/signout")
    public Mono<ResponseEntity<AuthResponse>> signOut(@RequestHeader("Authorization") String token) {
        return authService.signOut(token.replace("Bearer ", ""))
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
} 