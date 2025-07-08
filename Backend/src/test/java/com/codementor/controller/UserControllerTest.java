package com.codementor.controller;

import com.codementor.domain.User;
import com.codementor.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllUsers() {
        List<User> users = Arrays.asList(new User(), new User());
        when(userService.getAllUsers()).thenReturn(users);
        ResponseEntity<List<User>> response = userController.getAllUsers();
        assertEquals(users, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetUserById_Found() {
        User user = new User();
        when(userService.getUserById(1)).thenReturn(Optional.of(user));
        ResponseEntity<User> response = userController.getUserById(1);
        assertEquals(user, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetUserById_NotFound() {
        when(userService.getUserById(1)).thenReturn(Optional.empty());
        ResponseEntity<User> response = userController.getUserById(1);
        assertNull(response.getBody());
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void testUpdateUser_Success() {
        User userDetails = new User();
        User updatedUser = new User();
        when(userService.updateUser(1, userDetails)).thenReturn(updatedUser);
        ResponseEntity<User> response = userController.updateUser(1, userDetails);
        assertEquals(updatedUser, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testUpdateUser_NotFound() {
        User userDetails = new User();
        when(userService.updateUser(1, userDetails)).thenThrow(new RuntimeException());
        ResponseEntity<User> response = userController.updateUser(1, userDetails);
        assertNull(response.getBody());
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void testDeleteUser() {
        doNothing().when(userService).deleteUser(1);
        ResponseEntity<Void> response = userController.deleteUser(1);
        assertNull(response.getBody());
        assertEquals(200, response.getStatusCode().value());
        verify(userService, times(1)).deleteUser(1);
    }
} 