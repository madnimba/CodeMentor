package com.codementor.controller;

import com.codementor.dto.article.ArticleResponse;
import com.codementor.dto.article.CreateArticleRequest;
import com.codementor.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ArticleResponse> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ArticleResponse>> getArticles(
            @RequestParam(required = false) Long trackId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long subtopicId,
            @RequestParam(required = false) Long jobRoleId,
            Pageable pageable) {
        return ResponseEntity.ok(articleService.getArticlesByFilters(trackId, topicId, subtopicId, jobRoleId, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ArticleResponse> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(articleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
} 