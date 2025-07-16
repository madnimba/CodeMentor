package com.codementor.repository;

import com.codementor.domain.UserArticleRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserArticleReadRepository extends JpaRepository<UserArticleRead, Integer> {
    
    @Query("SELECT uar FROM UserArticleRead uar WHERE uar.user.id = :userId AND uar.article.id = :articleId")
    Optional<UserArticleRead> findByUserIdAndArticleId(@Param("userId") Integer userId, @Param("articleId") Integer articleId);
    
    @Query("SELECT uar.article.id FROM UserArticleRead uar WHERE uar.user.id = :userId")
    List<Integer> findArticleIdsByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(uar) FROM UserArticleRead uar WHERE uar.user.id = :userId")
    Long countByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(uar) FROM UserArticleRead uar WHERE uar.article.id = :articleId")
    Long countByArticleId(@Param("articleId") Integer articleId);
} 