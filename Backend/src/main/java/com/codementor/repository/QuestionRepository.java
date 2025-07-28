package com.codementor.repository;

import com.codementor.domain.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    Optional<Question> findBySlug(String slug);
    
    @Query("SELECT q FROM Question q WHERE q.isApproved = false")
    Page<Question> findByIsApprovedFalse(Pageable pageable);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.isApproved = false")
    long countByIsApprovedFalse();

    @Query("SELECT q FROM Question q WHERE q.isCoding = true")
    Page<Question> findByIsCodingTrue(Pageable pageable);
    
    @Query("SELECT q FROM Question q WHERE q.isApproved = false")
    List<Question> findByIsApprovedFalse();
} 