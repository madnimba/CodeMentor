package com.codementor.repository;

import com.codementor.domain.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HintRepository extends JpaRepository<Hint, Integer> {
    List<Hint> findByQuestionIdOrderByHintOrderAsc(Integer questionId);
} 