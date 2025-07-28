package com.codementor.repository;

import com.codementor.domain.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Integer> {
    
    // Find all submissions by user
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Integer userId);
    
    // Find all submissions by question
    List<Submission> findByQuestionIdOrderBySubmittedAtDesc(Integer questionId);
    
    // Find submissions by user and question
    List<Submission> findByUserIdAndQuestionIdOrderBySubmittedAtDesc(Integer userId, Integer questionId);
    
    // Find latest submission by user and question
    Optional<Submission> findFirstByUserIdAndQuestionIdOrderBySubmittedAtDesc(Integer userId, Integer questionId);
    
    // Find accepted submissions by user and question
    List<Submission> findByUserIdAndQuestionIdAndStatusOrderBySubmittedAtDesc(Integer userId, Integer questionId, String status);
    
    // Count unique questions attempted by user
    @Query("SELECT COUNT(DISTINCT s.question.id) FROM Submission s WHERE s.user.id = :userId")
    Long countUniqueQuestionsAttemptedByUser(@Param("userId") Integer userId);
    
    // Count unique questions solved by user (at least one accepted submission)
    @Query("SELECT COUNT(DISTINCT s.question.id) FROM Submission s WHERE s.user.id = :userId AND s.status = 'accepted'")
    Long countUniqueQuestionsSolvedByUser(@Param("userId") Integer userId);
    
    // Count total submissions by user
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId")
    Long countTotalSubmissionsByUser(@Param("userId") Integer userId);
    
    // Count accepted submissions by user
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'accepted'")
    Long countAcceptedSubmissionsByUser(@Param("userId") Integer userId);
    
    // Get all submission timestamps for user (ordered by date descending)
    @Query("SELECT DISTINCT s.submittedAt FROM Submission s WHERE s.user.id = :userId ORDER BY s.submittedAt DESC")
    List<LocalDateTime> getSubmissionTimestampsByUser(@Param("userId") Integer userId);
} 