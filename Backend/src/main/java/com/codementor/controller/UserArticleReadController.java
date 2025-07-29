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
     * Mark an article as read by the current user
     * POST /user-article-reads/mark/{articleId}
     */
    @PostMapping("/mark/{articleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markArticleAsRead(@PathVariable Integer articleId) {
        userArticleReadService.markArticleAsRead(articleId);
        return ResponseEntity.ok(ApiResponse.success("Article marked as read"));
    }

    /**
     * Mark an article as unread by the current user
     * DELETE /user-article-reads/{articleId}
     */
    @DeleteMapping("/{articleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markArticleAsUnread(@PathVariable Integer articleId) {
        userArticleReadService.markArticleAsUnread(articleId);
        return ResponseEntity.ok(ApiResponse.success("Article marked as unread"));
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