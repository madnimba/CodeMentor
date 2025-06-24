package com.codementor.exception;

import com.codementor.dto.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void handleResourceNotFoundException_ReturnsCorrectResponse() {
        // Arrange
        String errorMessage = "Resource not found";
        ResourceNotFoundException exception = new ResourceNotFoundException(errorMessage);

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleResourceNotFoundException(exception);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(errorMessage, response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleUnauthorizedException_ReturnsCorrectResponse() {
        // Arrange
        String errorMessage = "Unauthorized access";
        UnauthorizedException exception = new UnauthorizedException(errorMessage);

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleUnauthorizedException(exception);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(errorMessage, response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleAuthenticationException_ReturnsCorrectResponse() {
        // Arrange
        String errorMessage = "Authentication failed";
        AuthenticationException exception = mock(AuthenticationException.class);
        when(exception.getMessage()).thenReturn(errorMessage);

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleAuthenticationException(exception);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Authentication failed", response.getBody().getMessage());
        assertEquals(errorMessage, response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleBadCredentialsException_ReturnsCorrectResponse() {
        // Arrange
        BadCredentialsException exception = new BadCredentialsException("Invalid credentials");

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleBadCredentialsException(exception);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid credentials", response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleAccessDeniedException_ReturnsCorrectResponse() {
        // Arrange
        String errorMessage = "Access denied";
        AccessDeniedException exception = new AccessDeniedException(errorMessage);

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleAccessDeniedException(exception);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Access denied", response.getBody().getMessage());
        assertEquals(errorMessage, response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleValidationExceptions_ReturnsCorrectResponse() {
        // Arrange
        Map<String, String> expectedErrors = new HashMap<>();
        expectedErrors.put("email", "Email is required");
        expectedErrors.put("password", "Password is required");

        BindingResult bindingResult = mock(BindingResult.class);
        FieldError emailError = new FieldError("user", "email", "Email is required");
        FieldError passwordError = new FieldError("user", "password", "Password is required");
        
        when(bindingResult.getAllErrors()).thenReturn(Collections.singletonList(emailError));
        when(bindingResult.getAllErrors()).thenReturn(Collections.singletonList(passwordError));

        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);

        // Act
        ResponseEntity<ApiResponse<Map<String, String>>> response = globalExceptionHandler.handleValidationExceptions(exception);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleConstraintViolationException_ReturnsCorrectResponse() {
        // Arrange
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getPropertyPath()).thenReturn(mock(jakarta.validation.Path.class));
        when(violation.getPropertyPath().toString()).thenReturn("email");
        when(violation.getMessage()).thenReturn("Email is required");

        Set<ConstraintViolation<?>> violations = Collections.singleton(violation);
        ConstraintViolationException exception = new ConstraintViolationException("Validation failed", violations);

        // Act
        ResponseEntity<ApiResponse<Map<String, String>>> response = globalExceptionHandler.handleConstraintViolationException(exception);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertFalse(response.getBody().isSuccess());
        assertNotNull(response.getBody().getError());
    }

    @Test
    void handleGenericException_ReturnsCorrectResponse() {
        // Arrange
        String errorMessage = "An unexpected error occurred";
        Exception exception = new RuntimeException("Something went wrong");

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleGenericException(exception);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(errorMessage, response.getBody().getMessage());
        assertEquals("Something went wrong", response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void handleNullPointerException_ReturnsCorrectResponse() {
        // Arrange
        NullPointerException exception = new NullPointerException("Object is null");

        // Act
        ResponseEntity<ApiResponse<Void>> response = globalExceptionHandler.handleGenericException(exception);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
        assertEquals("Object is null", response.getBody().getError());
        assertFalse(response.getBody().isSuccess());
    }
} 