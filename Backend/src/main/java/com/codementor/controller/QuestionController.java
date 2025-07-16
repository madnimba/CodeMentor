package com.codementor.controller;

import com.codementor.dto.question.CreateQuestionRequest;
import com.codementor.dto.question.QuestionResponse;
import com.codementor.dto.question.UpdateQuestionRequest;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionBySlug(slug)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getAllQuestions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getAllQuestions(pageable)));
    }

    @GetMapping("/track/{trackId}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByTrack(
            @PathVariable Integer trackId, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByTrack(trackId, pageable)));
    }

    @GetMapping("/subtopic/{subtopicId}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsBySubtopic(
            @PathVariable Integer subtopicId, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsBySubtopic(subtopicId, pageable)));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByDifficulty(
            @PathVariable String difficulty, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByDifficulty(difficulty, pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> searchQuestionsByTitle(
            @RequestParam String title, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.searchQuestionsByTitle(title, pageable)));
    }

    @GetMapping("/importance/{importanceTag}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByImportanceTag(
            @PathVariable String importanceTag, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByImportanceTag(importanceTag, pageable)));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByCreator(
            @PathVariable Integer creatorId, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByCreator(creatorId, pageable)));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getPopularQuestions(
            @RequestParam(defaultValue = "5") Integer minUpvotes, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsWithMinUpvotes(minUpvotes, pageable)));
    }

    @GetMapping("/track/{trackId}/difficulty/{difficulty}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByTrackAndDifficulty(
            @PathVariable Integer trackId,
            @PathVariable String difficulty, 
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByTrackAndDifficulty(trackId, difficulty, pageable)));
    }

    @GetMapping("/check-fingerprint")
    public ResponseEntity<ApiResponse<Boolean>> checkContentFingerprintExists(
            @RequestParam String contentFingerprint) {
        return ResponseEntity.ok(ApiResponse.success(questionService.isContentFingerprintExists(contentFingerprint)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(questionService.updateQuestion(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    @PostMapping("/{id}/upvote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> upvoteQuestion(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.upvoteQuestion(id)));
    }

    @PostMapping("/{id}/downvote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> downvoteQuestion(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.downvoteQuestion(id)));
    }
} 