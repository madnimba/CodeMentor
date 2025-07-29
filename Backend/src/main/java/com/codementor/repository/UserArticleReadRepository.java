package com.codementor.repository;

import com.codementor.domain.UserArticleRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserArticleReadRepository extends JpaRepository<UserArticleRead, Integer> {
    
    // Check if user has read a specific article
    @Query("SELECT uar FROM UserArticleRead uar WHERE uar.user.id = :userId AND uar.article.id = :articleId")
    Optional<UserArticleRead> findByUserIdAndArticleId(@Param("userId") Integer userId, @Param("articleId") Integer articleId);
    
    // Check if user has read an article (boolean check)
    @Query("SELECT COUNT(uar) > 0 FROM UserArticleRead uar WHERE uar.user.id = :userId AND uar.article.id = :articleId")
    boolean existsByUserIdAndArticleId(@Param("userId") Integer userId, @Param("articleId") Integer articleId);
    
    // Count total articles read by user
    @Query("SELECT COUNT(uar) FROM UserArticleRead uar WHERE uar.user.id = :userId")
    Long countByUserId(@Param("userId") Integer userId);
} 