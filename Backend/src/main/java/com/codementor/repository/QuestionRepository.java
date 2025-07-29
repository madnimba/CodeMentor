package com.codementor.repository;

import com.codementor.domain.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    @Query(value = "SELECT q.* FROM questions q " +
           "JOIN questiontopics qt ON q.id = qt.question_id " +
           "WHERE qt.topic_id = ?1 AND q.is_approved = true " +
           "ORDER BY q.upvotes DESC, q.created_at DESC", nativeQuery = true)
    List<Question> findByTopicIdAndApproved(Integer topicId);
    
    @Query(value = "SELECT q.* FROM questions q " +
           "JOIN questiontopics qt ON q.id = qt.question_id " +
           "WHERE qt.topic_id = ?1 AND q.is_approved = true " +
           "ORDER BY q.upvotes DESC, q.created_at DESC", 
           countQuery = "SELECT COUNT(q.id) FROM questions q " +
           "JOIN questiontopics qt ON q.id = qt.question_id " +
           "WHERE qt.topic_id = ?1 AND q.is_approved = true", 
           nativeQuery = true)
    Page<Question> findByTopicIdAndApproved(Integer topicId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.subtopic.topic.id = :topicId")
    List<Question> findByTopicId(@Param("topicId") Integer topicId);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.subtopic.topic.id = :topicId")
    Long countByTopicId(@Param("topicId") Integer topicId);
    
    @Query("SELECT COUNT(DISTINCT s.question) FROM Submission s WHERE s.user.id = :userId AND s.question.subtopic.topic.id = :topicId AND s.status = 'accepted'")
    Long countSolvedQuestionsByUserAndTopic(@Param("userId") Integer userId, @Param("topicId") Integer topicId);
} 