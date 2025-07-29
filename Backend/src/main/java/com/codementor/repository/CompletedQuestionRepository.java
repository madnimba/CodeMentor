package com.codementor.repository;

import com.codementor.domain.CompletedQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompletedQuestionRepository extends JpaRepository<CompletedQuestion, Integer> {
    
    // Check if user has completed a specific question
    @Query("SELECT cq FROM CompletedQuestion cq WHERE cq.user.id = :userId AND cq.question.id = :questionId")
    Optional<CompletedQuestion> findByUserIdAndQuestionId(@Param("userId") Integer userId, @Param("questionId") Integer questionId);
    
    // Check if user has completed a question (boolean check)
    @Query("SELECT COUNT(cq) > 0 FROM CompletedQuestion cq WHERE cq.user.id = :userId AND cq.question.id = :questionId")
    boolean existsByUserIdAndQuestionId(@Param("userId") Integer userId, @Param("questionId") Integer questionId);
} 