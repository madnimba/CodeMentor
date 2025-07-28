package com.codementor.controller;

import com.codementor.domain.User;
import com.codementor.dto.submission.CreateSubmissionRequest;
import com.codementor.dto.submission.SubmissionResponse;
import com.codementor.dto.submission.StreakStats;
import com.codementor.dto.common.ApiResponse;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.UserRepository;
import com.codementor.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    
    private final SubmissionService submissionService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubmissionResponse>> saveSubmission(@Valid @RequestBody CreateSubmissionRequest request) {
        SubmissionResponse response = submissionService.saveSubmission(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionById(@PathVariable Integer id) {
        SubmissionResponse response = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByUser(@PathVariable Integer userId) {
        List<SubmissionResponse> submissions = submissionService.getSubmissionsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByQuestion(@PathVariable Integer questionId) {
        List<SubmissionResponse> submissions = submissionService.getSubmissionsByQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    @GetMapping("/user/{userId}/question/{questionId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getUserSubmissionsForQuestion(
            @PathVariable Integer userId, 
            @PathVariable Integer questionId) {
        List<SubmissionResponse> submissions = submissionService.getUserSubmissionsForQuestion(userId, questionId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }
    
    @GetMapping("/stats/attempted")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getTotalQuestionsAttempted() {
        // Get current user ID from authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Long totalAttempted = submissionService.getTotalQuestionsAttempted(user.getId());
        return ResponseEntity.ok(ApiResponse.success(totalAttempted));
    }
    
    @GetMapping("/stats/solved")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getTotalQuestionsSolved() {
        // Get current user ID from authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Long totalSolved = submissionService.getTotalQuestionsSolved(user.getId());
        return ResponseEntity.ok(ApiResponse.success(totalSolved));
    }
    
    @GetMapping("/stats/accuracy")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Double>> getAccuracyRate() {
        // Get current user ID from authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Double accuracyRate = submissionService.getAccuracyRate(user.getId());
        return ResponseEntity.ok(ApiResponse.success(accuracyRate));
    }
    
    @GetMapping("/stats/streak")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<StreakStats>> getStreakStats() {
        // Get current user ID from authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        StreakStats streakStats = submissionService.getStreakStats(user.getId());
        return ResponseEntity.ok(ApiResponse.success(streakStats));
    }
} 