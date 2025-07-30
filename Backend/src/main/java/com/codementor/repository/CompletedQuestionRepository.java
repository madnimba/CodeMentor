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
    
    // Count completed non-coding questions by user for a specific company
    @Query("SELECT COUNT(cq) FROM CompletedQuestion cq " +
           "JOIN CompanyQuestion companyQ ON cq.question.id = companyQ.question.id " +
           "WHERE cq.user.id = :userId AND cq.question.isCoding = false AND companyQ.company.id = :companyId")
    Long countCompletedNonCodingQuestionsByUserForCompany(@Param("userId") Integer userId, @Param("companyId") Integer companyId);
    
    // Count all completed questions by user
    @Query("SELECT COUNT(cq) FROM CompletedQuestion cq WHERE cq.user.id = :userId")
    Long countByUserId(@Param("userId") Integer userId);
} 