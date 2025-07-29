package com.codementor.controller;

import com.codementor.dto.common.ApiResponse;
import com.codementor.service.UserArticleReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user-article-reads")
@RequiredArgsConstructor
public class UserArticleReadController {

    private final UserArticleReadService userArticleReadService;

    /**
     * Track when user reads an article
     * POST /user-article-reads/track/{articleId}
     */
    @PostMapping("/track/{articleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> trackArticleRead(@PathVariable Integer articleId) {
        userArticleReadService.trackArticleRead(articleId);
        return ResponseEntity.ok(ApiResponse.success("Article read tracked successfully", "Article read tracked"));
    }

    /**
     * Check if user has read an article
     * GET /user-article-reads/check/{articleId}
     */
    @GetMapping("/check/{articleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> hasUserReadArticle(@PathVariable Integer articleId) {
        boolean hasRead = userArticleReadService.hasUserReadArticle(articleId);
        return ResponseEntity.ok(ApiResponse.success(hasRead));
    }

    /**
     * Get total articles read by current user
     * GET /user-article-reads/count
     */
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getTotalArticlesRead() {
        Long totalRead = userArticleReadService.getTotalArticlesReadByUser();
        return ResponseEntity.ok(ApiResponse.success(totalRead));
    }
} 