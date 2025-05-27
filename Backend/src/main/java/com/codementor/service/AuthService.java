package com.codementor.service;

import com.codementor.dto.AuthRequest;
import com.codementor.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class AuthService {
    
    private final WebClient supabaseWebClient;
    
    @Value("${supabase.api-key}")
    private String supabaseApiKey;
    
    public AuthService(WebClient supabaseWebClient) {
        this.supabaseWebClient = supabaseWebClient;
    }
    
    public Mono<AuthResponse> signUp(AuthRequest request) {
        return supabaseWebClient
                .post()
                .uri("/auth/v1/signup")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthResponse.class);
    }
    
    public Mono<AuthResponse> signIn(AuthRequest request) {
        return supabaseWebClient
                .post()
                .uri("/auth/v1/token?grant_type=password")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthResponse.class);
    }
    
    public Mono<AuthResponse> signOut(String accessToken) {
        return supabaseWebClient
                .post()
                .uri("/auth/v1/logout")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(AuthResponse.class);
    }
} 