package com.codementor.service;

import com.codementor.domain.User;
import com.codementor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private User updatedUser;
    private static final Integer TEST_USER_ID = 1;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_PASSWORD = "password123";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(TEST_USER_ID);
        testUser.setEmail(TEST_EMAIL);
        testUser.setUsername(TEST_USERNAME);
        testUser.setPassword(TEST_PASSWORD);
        testUser.setCreatedAt(LocalDateTime.now());

        updatedUser = new User();
        updatedUser.setId(TEST_USER_ID);
        updatedUser.setEmail("updated@example.com");
        updatedUser.setUsername("updateduser");
        updatedUser.setPassword("newpassword123");
    }

    @Test
    void createUser_Success() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.createUser(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_USER_ID, result.getId());
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals(TEST_USERNAME, result.getUsername());
        verify(userRepository).save(testUser);
    }

    @Test
    void getUserById_UserExists_ReturnsUser() {
        // Arrange
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserById(TEST_USER_ID);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
        verify(userRepository).findById(TEST_USER_ID);
    }

    @Test
    void getUserById_UserDoesNotExist_ReturnsEmpty() {
        // Arrange
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserById(TEST_USER_ID);

        // Assert
        assertFalse(result.isPresent());
        verify(userRepository).findById(TEST_USER_ID);
    }

    @Test
    void getUserByEmail_UserExists_ReturnsUser() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserByEmail(TEST_EMAIL);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
        verify(userRepository).findByEmail(TEST_EMAIL);
    }

    @Test
    void getUserByEmail_UserDoesNotExist_ReturnsEmpty() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserByEmail(TEST_EMAIL);

        // Assert
        assertFalse(result.isPresent());
        verify(userRepository).findByEmail(TEST_EMAIL);
    }

    @Test
    void getAllUsers_Success() {
        // Arrange
        List<User> users = Arrays.asList(testUser, updatedUser);
        when(userRepository.findAll()).thenReturn(users);

        // Act
        List<User> result = userService.getAllUsers();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(users, result);
        verify(userRepository).findAll();
    }

    @Test
    void updateUser_UserExists_Success() {
        // Arrange
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        // Act
        User result = userService.updateUser(TEST_USER_ID, updatedUser);

        // Assert
        assertNotNull(result);
        assertEquals(updatedUser.getEmail(), result.getEmail());
        assertEquals(updatedUser.getUsername(), result.getUsername());
        verify(userRepository).findById(TEST_USER_ID);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser_UserDoesNotExist_ThrowsException() {
        // Arrange
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUser(TEST_USER_ID, updatedUser));
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(TEST_USER_ID);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_Success() {
        // Arrange
        doNothing().when(userRepository).deleteById(TEST_USER_ID);

        // Act
        userService.deleteUser(TEST_USER_ID);

        // Assert
        verify(userRepository).deleteById(TEST_USER_ID);
    }

    @Test
    void existsByEmail_UserExists_ReturnsTrue() {
        // Arrange
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

        // Act
        boolean result = userService.existsByEmail(TEST_EMAIL);

        // Assert
        assertTrue(result);
        verify(userRepository).existsByEmail(TEST_EMAIL);
    }

    @Test
    void existsByEmail_UserDoesNotExist_ReturnsFalse() {
        // Arrange
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);

        // Act
        boolean result = userService.existsByEmail(TEST_EMAIL);

        // Assert
        assertFalse(result);
        verify(userRepository).existsByEmail(TEST_EMAIL);
    }
} 