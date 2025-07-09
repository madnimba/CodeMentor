package com.codementor.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.*;

class UnauthorizedExceptionTest {

    @Test
    void constructor_WithMessage_SetsMessageCorrectly() {
        // Arrange
        String testMessage = "Access denied";

        // Act
        UnauthorizedException exception = new UnauthorizedException(testMessage);

        // Assert
        assertEquals(testMessage, exception.getMessage());
    }

    @Test
    void constructor_WithNullMessage_SetsNullMessage() {
        // Act
        UnauthorizedException exception = new UnauthorizedException(null);

        // Assert
        assertNull(exception.getMessage());
    }

    @Test
    void constructor_WithEmptyMessage_SetsEmptyMessage() {
        // Act
        UnauthorizedException exception = new UnauthorizedException("");

        // Assert
        assertEquals("", exception.getMessage());
    }

    @Test
    void exception_IsRuntimeException() {
        // Arrange
        UnauthorizedException exception = new UnauthorizedException("Test message");

        // Act & Assert
        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    void exception_HasResponseStatusAnnotation() {
        // Act
        ResponseStatus responseStatus = UnauthorizedException.class.getAnnotation(ResponseStatus.class);

        // Assert
        assertNotNull(responseStatus);
        assertEquals(HttpStatus.FORBIDDEN, responseStatus.value());
    }

    @Test
    void exception_CanBeThrown() {
        // Arrange
        String testMessage = "User not authorized";

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            throw new UnauthorizedException(testMessage);
        });

        assertEquals(testMessage, exception.getMessage());
    }

    @Test
    void exception_CanBeCaught() {
        // Arrange
        String testMessage = "Insufficient permissions";

        // Act
        try {
            throw new UnauthorizedException(testMessage);
        } catch (UnauthorizedException e) {
            // Assert
            assertEquals(testMessage, e.getMessage());
            assertInstanceOf(RuntimeException.class, e);
        }
    }

    @Test
    void exception_HasCorrectHttpStatus() {
        // Act
        ResponseStatus annotation = UnauthorizedException.class.getAnnotation(ResponseStatus.class);

        // Assert
        assertNotNull(annotation);
        assertEquals(HttpStatus.FORBIDDEN, annotation.value());
        assertEquals(403, annotation.value().value());
    }

    @Test
    void exception_DifferentFromResourceNotFoundException() {
        // Arrange
        UnauthorizedException unauthorizedException = new UnauthorizedException("Unauthorized");
        ResourceNotFoundException resourceNotFoundException = new ResourceNotFoundException("Not found");

        // Act & Assert
        assertNotEquals(unauthorizedException.getClass(), resourceNotFoundException.getClass());
        
        ResponseStatus unauthorizedAnnotation = UnauthorizedException.class.getAnnotation(ResponseStatus.class);
        ResponseStatus resourceNotFoundAnnotation = ResourceNotFoundException.class.getAnnotation(ResponseStatus.class);
        
        assertNotEquals(unauthorizedAnnotation.value(), resourceNotFoundAnnotation.value());
        assertEquals(HttpStatus.FORBIDDEN, unauthorizedAnnotation.value());
        assertEquals(HttpStatus.NOT_FOUND, resourceNotFoundAnnotation.value());
    }
} 