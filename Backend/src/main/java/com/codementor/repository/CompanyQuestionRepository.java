package com.codementor.repository;

import com.codementor.domain.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Integer> {
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId")
    List<CompanyQuestion> findByCompanyId(Integer companyId);
    CompanyQuestion findByCompanyIdAndQuestionId(Integer companyId, Integer questionId);
    int countByCompanyId(Integer companyId);
}   