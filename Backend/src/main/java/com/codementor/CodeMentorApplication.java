package com.codementor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CodeMentorApplication {
    public static void main(String[] args) {
        SpringApplication.run(CodeMentorApplication.class, args);
    }
} 