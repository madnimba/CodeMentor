package com.codementor.repository;

import com.codementor.domain.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Integer> {
    List<CompanyQuestion> findByCompanyId(Integer companyId);
    CompanyQuestion findByCompanyIdAndQuestionId(Integer companyId, Integer questionId);
}   