package com.codementor.repository;

import com.codementor.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    Optional<Article> findBySlug(String slug);
    
    @Query("SELECT a FROM Article a WHERE a.isApproved = true ORDER BY a.createdAt DESC")
    List<Article> findApprovedArticles();
    
    @Query("SELECT COUNT(a) FROM Article a WHERE a.topic.id = :topicId AND a.isApproved = true")
    Long countByTopicId(@Param("topicId") Integer topicId);
    
    @Query("SELECT COUNT(uar) FROM UserArticleRead uar WHERE uar.user.id = :userId AND uar.article.topic.id = :topicId AND uar.article.isApproved = true")
    Long countArticlesReadByUserAndTopic(@Param("userId") Integer userId, @Param("topicId") Integer topicId);
    
    @Query("SELECT a FROM Article a WHERE a.isApproved = true")
    Page<Article> findAllApproved(Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.track.id = ?1 AND a.isApproved = true")
    Page<Article> findByTrackId(Integer trackId, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.topic.id = ?1 AND a.isApproved = true")
    Page<Article> findByTopicId(Integer topicId, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.subtopic.id = ?1 AND a.isApproved = true")
    Page<Article> findBySubtopicId(Integer subtopicId, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.subtopic.id = ?1 AND a.isApproved = true")
    List<Article> findBySubtopicId(Integer subtopicId);
    
    @Query("SELECT a FROM Article a JOIN a.jobRoles j WHERE j.id = ?1 AND a.isApproved = true")
    Page<Article> findByJobRoleId(Integer jobRoleId, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.isApproved = false")
    Page<Article> findByIsApprovedFalse(Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Article a WHERE a.isApproved = false")
    long countByIsApprovedFalse();
    
    @Query("SELECT a FROM Article a WHERE a.isApproved = false")
    List<Article> findByIsApprovedFalse();
    
    // Bulk update method for approving all articles efficiently
    @Modifying
    @Query("UPDATE Article a SET a.isApproved = true WHERE a.isApproved = false")
    int bulkApproveAllArticles();
    
    // Search articles by multiple criteria
    @Query("SELECT a FROM Article a WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(a.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.track.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.topic.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "(a.subtopic IS NOT NULL AND LOWER(a.subtopic.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))) AND " +
           "(:isApproved IS NULL OR a.isApproved = :isApproved)")
    Page<Article> searchArticles(@Param("searchTerm") String searchTerm, 
                                @Param("isApproved") Boolean isApproved, 
                                Pageable pageable);
} 