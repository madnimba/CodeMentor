package com.codementor.service;

import com.codementor.domain.User;
import com.codementor.repository.UserRepository;
import com.codementor.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuthService {
    
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Transactional
    public String adminSignIn(String username, String password) {
        try {
            // First authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            // Check if the user is an admin
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!Boolean.TRUE.equals(user.getIsAdmin())) {
                throw new RuntimeException("Access denied. Admin privileges required.");
            }
            
            return jwtTokenProvider.generateToken(authentication);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid credentials");
        }
    }
    
    public void adminSignOut(String token) {
        // In a stateless JWT setup, we don't need to do anything on the server side
        // The client should remove the token
        // You could implement a blacklist here if needed
    }
} 