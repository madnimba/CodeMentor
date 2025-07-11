package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.dto.JwtResponse;
import com.codementor.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

class GoogleAuthRequest {
    public String idToken;
}

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
    public ResponseEntity<JwtResponse> signUp(@RequestBody AuthRequest request) {
        String token = authService.signUp(request.getEmail(), request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> signIn(@RequestBody AuthRequest request) {
        String token = authService.signIn(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/signout")
    public ResponseEntity<Void> signOut(@RequestHeader("Authorization") String token) {
        authService.signOut(token.replace("Bearer ", ""));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/google-signin")
    public ResponseEntity<JwtResponse> googleSignIn(@RequestBody GoogleAuthRequest request) {
        String token = authService.googleSignIn(request.idToken);
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/google-signup")
    public ResponseEntity<JwtResponse> googleSignUp(@RequestBody GoogleAuthRequest request) {
        String token = authService.googleSignUp(request.idToken);
        return ResponseEntity.ok(new JwtResponse(token));
    }
} 