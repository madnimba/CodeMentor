package com.codementor.repository;

import com.codementor.domain.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

@Repository
public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Integer> {
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId")
    List<CompanyQuestion> findByCompanyId(Integer companyId);
    
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId")
    Page<CompanyQuestion> findByCompanyId(Integer companyId, Pageable pageable);

    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId AND cq.question.isCoding = true")
    List<CompanyQuestion> findByCompanyIdAndQuestionIsCodingTrue(Integer companyId);
    
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question WHERE cq.company.id = :companyId AND cq.question.isCoding = true")
    Page<CompanyQuestion> findByCompanyIdAndQuestionIsCodingTrue(Integer companyId, Pageable pageable);

    CompanyQuestion findByCompanyIdAndQuestionId(Integer companyId, Integer questionId);
    long countByCompanyId(Integer companyId);
    
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.company WHERE cq.question.id = :questionId")
    List<CompanyQuestion> findByQuestionId(Integer questionId);

    // Get companies with most coding questions
    @Query("SELECT cq.company.id, cq.company.name, cq.company.logoUrl, cq.company.country, cq.company.description, COUNT(cq.question.id) as totalQuestions " +
           "FROM CompanyQuestion cq " +
           "WHERE cq.question.isCoding = true " +
           "GROUP BY cq.company.id, cq.company.name, cq.company.logoUrl, cq.company.country, cq.company.description " +
           "ORDER BY totalQuestions DESC")
    List<Object[]> findCompaniesWithMostCodingQuestions();

    // Count solved questions by user for a specific company
    @Query("SELECT COUNT(DISTINCT s.question.id) " +
           "FROM Submission s " +
           "JOIN CompanyQuestion cq ON s.question.id = cq.question.id " +
           "WHERE cq.company.id = :companyId AND s.user.id = :userId AND s.status = 'accepted'")
    Long countSolvedQuestionsByUserForCompany(@Param("companyId") Integer companyId, @Param("userId") Integer userId);

    // Count total coding questions for a company
    @Query("SELECT COUNT(cq.question.id) " +
           "FROM CompanyQuestion cq " +
           "WHERE cq.company.id = :companyId AND cq.question.isCoding = true")
    Long countTotalCodingQuestionsForCompany(@Param("companyId") Integer companyId);
}   