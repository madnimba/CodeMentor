package com.codementor;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Disabled("Disabled in CI because it requires full application context")
class CodeMentorApplicationTests {
    @Test
    void contextLoads() {
    }
}