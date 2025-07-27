package com.codementor.repository;

import com.codementor.domain.Testcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestcaseRepository extends JpaRepository<Testcase, Integer> {
    List<Testcase> findByQuestionIdAndIsPublicTrueOrderByIdAsc(Integer questionId);
    List<Testcase> findByQuestionId(Integer questionId);
    
    long countByQuestionId(Integer questionId);
} 