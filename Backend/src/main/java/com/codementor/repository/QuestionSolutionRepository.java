package com.codementor.repository;

import com.codementor.domain.QuestionSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionSolutionRepository extends JpaRepository<QuestionSolution, Integer> {
    @Query("SELECT qs.code FROM QuestionSolution qs WHERE qs.question.id = :questionId")
    List<String> findCodesByQuestionId(Integer questionId);

    @Query("SELECT qs.code FROM QuestionSolution qs WHERE qs.question.id = :questionId ORDER BY qs.submittedAt ASC LIMIT 1")
    String findFirstCodeByQuestionId(Integer questionId);
} 