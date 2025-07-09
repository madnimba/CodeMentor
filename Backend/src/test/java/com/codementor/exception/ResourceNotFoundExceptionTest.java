package com.codementor.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void constructor_WithMessage_SetsMessageCorrectly() {
        // Arrange
        String testMessage = "Resource not found";

        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException(testMessage);

        // Assert
        assertEquals(testMessage, exception.getMessage());
    }

    @Test
    void constructor_WithNullMessage_SetsNullMessage() {
        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException(null);

        // Assert
        assertNull(exception.getMessage());
    }

    @Test
    void constructor_WithEmptyMessage_SetsEmptyMessage() {
        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException("");

        // Assert
        assertEquals("", exception.getMessage());
    }

    @Test
    void exception_IsRuntimeException() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");

        // Act & Assert
        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    void exception_HasResponseStatusAnnotation() {
        // Act
        ResponseStatus responseStatus = ResourceNotFoundException.class.getAnnotation(ResponseStatus.class);

        // Assert
        assertNotNull(responseStatus);
        assertEquals(HttpStatus.NOT_FOUND, responseStatus.value());
    }

    @Test
    void exception_CanBeThrown() {
        // Arrange
        String testMessage = "User not found";

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            throw new ResourceNotFoundException(testMessage);
        });

        assertEquals(testMessage, exception.getMessage());
    }

    @Test
    void exception_CanBeCaught() {
        // Arrange
        String testMessage = "Article not found";

        // Act
        try {
            throw new ResourceNotFoundException(testMessage);
        } catch (ResourceNotFoundException e) {
            // Assert
            assertEquals(testMessage, e.getMessage());
            assertInstanceOf(RuntimeException.class, e);
        }
    }

    @Test
    void exception_HasCorrectHttpStatus() {
        // Act
        ResponseStatus annotation = ResourceNotFoundException.class.getAnnotation(ResponseStatus.class);

        // Assert
        assertNotNull(annotation);
        assertEquals(HttpStatus.NOT_FOUND, annotation.value());
        assertEquals(404, annotation.value().value());
    }
} 