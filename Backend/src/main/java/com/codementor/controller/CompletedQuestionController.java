package com.codementor.controller;

import com.codementor.dto.common.ApiResponse;
import com.codementor.dto.completedquestion.MarkQuestionCompletedRequest;
import com.codementor.service.CompletedQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/completed-questions")
@RequiredArgsConstructor
public class CompletedQuestionController {

    private final CompletedQuestionService completedQuestionService;

    /**
     * Mark a question as completed
     * POST /completed-questions/mark
     */
    @PostMapping("/mark")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markQuestionCompleted(@Valid @RequestBody MarkQuestionCompletedRequest request) {
        completedQuestionService.markQuestionCompleted(request);
        return ResponseEntity.ok(ApiResponse.success("Question marked as completed"));
    }

    /**
     * Check if user has completed a question
     * GET /completed-questions/check/{questionId}
     */
    @GetMapping("/check/{questionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> hasUserCompletedQuestion(@PathVariable Integer questionId) {
        boolean hasCompleted = completedQuestionService.hasUserCompletedQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success(hasCompleted));
    }

    /**
     * Remove completion status for a question
     * DELETE /completed-questions/{questionId}
     */
    @DeleteMapping("/{questionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeQuestionCompletion(@PathVariable Integer questionId) {
        completedQuestionService.removeQuestionCompletion(questionId);
        return ResponseEntity.ok(ApiResponse.success("Question completion removed successfully"));
    }
} 