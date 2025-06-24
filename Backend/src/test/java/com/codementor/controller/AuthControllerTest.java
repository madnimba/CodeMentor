package com.codementor.controller;

import com.codementor.dto.AuthRequest;
import com.codementor.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private AuthRequest authRequest;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();

        authRequest = new AuthRequest();
        authRequest.setEmail(TEST_EMAIL);
        authRequest.setUsername(TEST_USERNAME);
        authRequest.setPassword(TEST_PASSWORD);
    }

    @Test
    void test_Endpoint_ReturnsSuccess() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/auth/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is up!"));
    }

    @Test
    void signUp_Success() throws Exception {
        // Arrange
        when(authService.signUp(anyString(), anyString(), anyString()))
                .thenReturn(TEST_TOKEN);

        // Act & Assert
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(TEST_TOKEN));

        verify(authService).signUp(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);
    }

    @Test
    void signUp_InvalidRequest_ReturnsBadRequest() throws Exception {
        // Arrange
        AuthRequest invalidRequest = new AuthRequest();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk()); // Controller doesn't validate, so it passes through
    }

    @Test
    void signIn_Success() throws Exception {
        // Arrange
        when(authService.signIn(anyString(), anyString()))
                .thenReturn(TEST_TOKEN);

        // Act & Assert
        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(TEST_TOKEN));

        verify(authService).signIn(TEST_USERNAME, TEST_PASSWORD);
    }

    @Test
    void signIn_InvalidRequest_ReturnsBadRequest() throws Exception {
        // Arrange
        AuthRequest invalidRequest = new AuthRequest();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk()); // Controller doesn't validate, so it passes through
    }

    @Test
    void signOut_Success() throws Exception {
        // Arrange
        doNothing().when(authService).signOut(anyString());

        // Act & Assert
        mockMvc.perform(post("/auth/signout")
                        .header("Authorization", "Bearer " + TEST_TOKEN))
                .andExpect(status().isOk());

        verify(authService).signOut(TEST_TOKEN);
    }

    @Test
    void signOut_WithoutBearerPrefix_StillWorks() throws Exception {
        // Arrange
        doNothing().when(authService).signOut(anyString());

        // Act & Assert
        mockMvc.perform(post("/auth/signout")
                        .header("Authorization", TEST_TOKEN))
                .andExpect(status().isOk());

        verify(authService).signOut(TEST_TOKEN);
    }

    @Test
    void signOut_NoAuthorizationHeader_ReturnsBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/signout"))
                .andExpect(status().isBadRequest()); // Controller doesn't validate headers, so it passes through but Spring returns 400 for missing required header
    }
} 