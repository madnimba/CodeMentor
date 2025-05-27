package com.codementor.service;

import com.codementor.domain.User;
import com.codementor.repository.UserRepository;
import com.codementor.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public String signUp(String email, String username, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        User savedUser = userRepository.save(user);
        System.out.println("User saved: " + savedUser);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        String token = jwtTokenProvider.generateToken(authentication);
        System.out.println("Token: " + token);
        return token;
    }
    
    public String signIn(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );
        return jwtTokenProvider.generateToken(authentication);
    }

    public void signOut(String token) {
        // In a real application, you might want to:
        // 1. Blacklist the token
        // 2. Clear any session data
        // 3. Update user's last logout time
        // For now, we'll just validate the token was valid
        jwtTokenProvider.validateToken(token);
    }
} 