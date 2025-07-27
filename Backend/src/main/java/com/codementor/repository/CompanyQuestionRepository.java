package com.codementor.repository;

import com.codementor.domain.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Integer> {
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId")
    List<CompanyQuestion> findByCompanyId(Integer companyId);
    
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId")
    Page<CompanyQuestion> findByCompanyId(Integer companyId, Pageable pageable);

    CompanyQuestion findByCompanyIdAndQuestionId(Integer companyId, Integer questionId);
    long countByCompanyId(Integer companyId);
    
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.company WHERE cq.question.id = :questionId")
    List<CompanyQuestion> findByQuestionId(Integer questionId);
}   