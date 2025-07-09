package com.codementor.security;

import com.codementor.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class CustomUserDetailsTest {

    private User testUser;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_PASSWORD = "encodedPassword123";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail(TEST_EMAIL);
        testUser.setUsername(TEST_USERNAME);
        testUser.setPassword(TEST_PASSWORD);
        testUser.setIsAdmin(false);
    }

    @Test
    void constructor_WithUser_SetsUserCorrectly() {
        // Act
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Assert
        assertEquals(testUser, customUserDetails.getUser());
    }

    @Test
    void getAuthorities_AdminUser_ReturnsAdminRole() {
        // Arrange
        testUser.setIsAdmin(true);
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        Collection<? extends GrantedAuthority> authorities = customUserDetails.getAuthorities();

        // Assert
        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        GrantedAuthority authority = authorities.iterator().next();
        assertEquals("ROLE_ADMIN", authority.getAuthority());
    }

    @Test
    void getAuthorities_RegularUser_ReturnsUserRole() {
        // Arrange
        testUser.setIsAdmin(false);
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        Collection<? extends GrantedAuthority> authorities = customUserDetails.getAuthorities();

        // Assert
        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        GrantedAuthority authority = authorities.iterator().next();
        assertEquals("ROLE_USER", authority.getAuthority());
    }

    @Test
    void getAuthorities_NullIsAdmin_ReturnsUserRole() {
        // Arrange
        testUser.setIsAdmin(null);
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        Collection<? extends GrantedAuthority> authorities = customUserDetails.getAuthorities();

        // Assert
        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        GrantedAuthority authority = authorities.iterator().next();
        assertEquals("ROLE_USER", authority.getAuthority());
    }

    @Test
    void getPassword_ReturnsUserPassword() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        String password = customUserDetails.getPassword();

        // Assert
        assertEquals(TEST_PASSWORD, password);
    }

    @Test
    void getUsername_ReturnsUserEmail() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        String username = customUserDetails.getUsername();

        // Assert
        assertEquals(TEST_EMAIL, username);
    }

    @Test
    void isAccountNonExpired_AlwaysReturnsTrue() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        boolean isAccountNonExpired = customUserDetails.isAccountNonExpired();

        // Assert
        assertTrue(isAccountNonExpired);
    }

    @Test
    void isAccountNonLocked_AlwaysReturnsTrue() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        boolean isAccountNonLocked = customUserDetails.isAccountNonLocked();

        // Assert
        assertTrue(isAccountNonLocked);
    }

    @Test
    void isCredentialsNonExpired_AlwaysReturnsTrue() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        boolean isCredentialsNonExpired = customUserDetails.isCredentialsNonExpired();

        // Assert
        assertTrue(isCredentialsNonExpired);
    }

    @Test
    void isEnabled_AlwaysReturnsTrue() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        boolean isEnabled = customUserDetails.isEnabled();

        // Assert
        assertTrue(isEnabled);
    }

    @Test
    void getUser_ReturnsOriginalUser() {
        // Arrange
        CustomUserDetails customUserDetails = new CustomUserDetails(testUser);

        // Act
        User user = customUserDetails.getUser();

        // Assert
        assertEquals(testUser, user);
        assertEquals(TEST_EMAIL, user.getEmail());
        assertEquals(TEST_USERNAME, user.getUsername());
        assertEquals(TEST_PASSWORD, user.getPassword());
    }
} 