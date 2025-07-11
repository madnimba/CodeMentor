package com.codementor.repository;

import com.codementor.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail_Positive() {
        User user = new User();
        user.setEmail("user1@example.com");
        user.setUsername("user1");
        user.setPassword("pass");
        userRepository.save(user);
        Optional<User> found = userRepository.findByEmail("user1@example.com");
        assertTrue(found.isPresent());
        assertEquals("user1", found.get().getUsername());
    }

    @Test
    void testFindByEmail_Negative() {
        Optional<User> found = userRepository.findByEmail("notfound@example.com");
        assertFalse(found.isPresent());
    }

    @Test
    void testExistsByEmailAndUsername() {
        User user = new User();
        user.setEmail("user2@example.com");
        user.setUsername("user2");
        user.setPassword("pass");
        userRepository.save(user);
        assertTrue(userRepository.existsByEmail("user2@example.com"));
        assertTrue(userRepository.existsByUsername("user2"));
        assertFalse(userRepository.existsByEmail("nope@example.com"));
        assertFalse(userRepository.existsByUsername("nope"));
    }
} 