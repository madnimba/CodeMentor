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
    Page<Question> findByTrackId(Integer trackId, Pageable pageable);
    Page<Question> findBySubtopicId(Integer subtopicId, Pageable pageable);
    Page<Question> findByDifficulty(Question.Difficulty difficulty, Pageable pageable);
    
    // Search questions by title containing the given text
    Page<Question> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Find questions by content fingerprint
    Optional<Question> findByContentFingerprint(String contentFingerprint);
    
    // Find questions by importance tag
    Page<Question> findByImportanceTag(String importanceTag, Pageable pageable);
    
    // Find questions by creator
    Page<Question> findByCreatedById(Integer createdById, Pageable pageable);
    
    // Custom query to find questions with high upvotes
    @Query("SELECT q FROM Question q WHERE q.upvotes >= :minUpvotes ORDER BY q.upvotes DESC")
    Page<Question> findQuestionsWithMinUpvotes(@Param("minUpvotes") Integer minUpvotes, Pageable pageable);
    
    // Find questions by track and difficulty
    Page<Question> findByTrackIdAndDifficulty(Integer trackId, Question.Difficulty difficulty, Pageable pageable);
} 