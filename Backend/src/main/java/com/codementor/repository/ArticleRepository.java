package com.codementor.repository;

import com.codementor.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    Optional<Article> findBySlug(String slug);
    
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
} 