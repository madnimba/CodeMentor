package com.codementor.service;

import com.codementor.domain.Article;
import com.codementor.domain.User;
import com.codementor.domain.UserArticleRead;
import com.codementor.repository.ArticleRepository;
import com.codementor.repository.UserArticleReadRepository;
import com.codementor.repository.UserRepository;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserArticleReadService {

    @Autowired
    private UserArticleReadRepository userArticleReadRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    /**
     * Mark an article as read by the current user
     */
    public void markArticleAsRead(Integer articleId) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Get the article
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));

        // Check if user has already read this article
        boolean hasRead = userArticleReadRepository.existsByUserIdAndArticleId(user.getId(), articleId);

        // If not read before, create a new record
        if (!hasRead) {
            UserArticleRead userArticleRead = new UserArticleRead();
            userArticleRead.setUser(user);
            userArticleRead.setArticle(article);
            userArticleReadRepository.save(userArticleRead);
        }
    }

    /**
     * Mark an article as unread by the current user
     */
    public void markArticleAsUnread(Integer articleId) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Remove the read record if it exists
        userArticleReadRepository.findByUserIdAndArticleId(user.getId(), articleId)
                .ifPresent(userArticleReadRepository::delete);
    }

    /**
     * Check if user has read a specific article
     */
    public boolean hasUserReadArticle(Integer articleId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userArticleReadRepository.existsByUserIdAndArticleId(user.getId(), articleId);
    }

    /**
     * Get total articles read by current user
     */
    public Long getTotalArticlesReadByUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userArticleReadRepository.countByUserId(user.getId());
    }
} 