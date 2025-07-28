package com.codementor.controller;

import com.codementor.dto.common.ApiResponse;
import com.codementor.dto.question.CreateQuestionRequest;
import com.codementor.dto.question.QuestionResponse;
import com.codementor.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(questionService.createQuestion(request)));
    }

    @GetMapping("/coding/paginated")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getCodingQuestionsPaginated(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getCodingQuestions(pageable)));
    }
} 