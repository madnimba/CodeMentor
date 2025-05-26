package com.codementor.service;

import com.codementor.domain.JobRole;
import com.codementor.domain.User;
import com.codementor.dto.auth.AuthResponse;
import com.codementor.dto.auth.LoginRequest;
import com.codementor.dto.auth.RegisterRequest;
import com.codementor.repository.JobRoleRepository;
import com.codementor.repository.UserRepository;
import com.codementor.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JobRoleRepository jobRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        JobRole jobRole = null;
        if (request.getJobRoleId() != null) {
            jobRole = jobRoleRepository.findById(request.getJobRoleId())
                    .orElseThrow(() -> new RuntimeException("Job role not found"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setJobRole(jobRole);
        user.setThemePreference(request.getThemePreference());
        user.setLanguagePreference(request.getLanguagePreference());

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .jobRoleId(user.getJobRole() != null ? user.getJobRole().getId() : null)
                .themePreference(user.getThemePreference())
                .languagePreference(user.getLanguagePreference())
                .isAdmin(user.getIsAdmin())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .jobRoleId(user.getJobRole() != null ? user.getJobRole().getId() : null)
                .themePreference(user.getThemePreference())
                .languagePreference(user.getLanguagePreference())
                .isAdmin(user.getIsAdmin())
                .build();
    }
} 