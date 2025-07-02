package com.codementor.controller;

import com.codementor.dto.article.ArticleResponse;
import com.codementor.dto.article.CreateArticleRequest;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/articles")
// No @CrossOrigin needed: global CORS config is used
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ArticleResponse>> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(articleService.createArticle(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticleById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(articleService.getArticleById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> getArticles(
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) Integer subtopicId,
            @RequestParam(required = false) Integer jobRoleId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            articleService.getArticlesByFilters(trackId, topicId, subtopicId, jobRoleId, pageable)
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ArticleResponse>> updateArticle(
            @PathVariable Integer id,
            @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(articleService.updateArticle(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Integer id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    @GetMapping("/by-subtopic/{subtopicId}")
    public ResponseEntity<ApiResponse<List<ArticleResponse>>> getArticlesBySubtopicId(@PathVariable Integer subtopicId) {
        List<ArticleResponse> articles = articleService.getArticlesBySubtopicId(subtopicId);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }
} 