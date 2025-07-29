package com.codementor.repository;

import com.codementor.domain.CompanyQuestion;
import com.codementor.domain.Question;
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
    @Query("SELECT cq.company, COUNT(cq) as questionCount FROM CompanyQuestion cq " +
           "WHERE cq.question.isCoding = true " +
           "GROUP BY cq.company " +
           "ORDER BY questionCount DESC")
    List<Object[]> findCompaniesWithMostCodingQuestions();
    
    // Search company questions by multiple criteria
    @Query("SELECT cq FROM CompanyQuestion cq JOIN FETCH cq.question q " +
           "WHERE cq.company.id = :companyId AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.track.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.subtopic.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "CAST(q.year AS string) LIKE CONCAT('%', :searchTerm, '%')) AND " +
           "(:isCoding IS NULL OR q.isCoding = :isCoding)")
    Page<CompanyQuestion> searchCompanyQuestions(@Param("companyId") Integer companyId,
                                                @Param("searchTerm") String searchTerm,
                                                @Param("isCoding") Boolean isCoding,
                                                Pageable pageable);
    
    // Comprehensive filtering for company questions
    @Query("SELECT cq FROM CompanyQuestion cq " +
           "JOIN FETCH cq.question q " +
           "LEFT JOIN q.subtopic s " +
           "LEFT JOIN s.topic t " +
           "LEFT JOIN q.track tr " +
           "WHERE cq.company.id = :companyId AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:trackId IS NULL OR tr.id = :trackId) AND " +
           "(:topicId IS NULL OR t.id = :topicId) AND " +
           "(:subtopicId IS NULL OR s.id = :subtopicId) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
           "(:year IS NULL OR q.year = :year) AND " +
           "(:isCoding IS NULL OR q.isCoding = :isCoding) AND " +
           "q.isApproved = true")
    Page<CompanyQuestion> findCompanyQuestionsWithFilters(@Param("companyId") Integer companyId,
                                                         @Param("searchTerm") String searchTerm,
                                                         @Param("trackId") Integer trackId,
                                                         @Param("topicId") Integer topicId,
                                                         @Param("subtopicId") Integer subtopicId,
                                                         @Param("difficulty") Question.Difficulty difficulty,
                                                         @Param("year") Short year,
                                                         @Param("isCoding") Boolean isCoding,
                                                         Pageable pageable);
    
    // Count solved questions by user for a specific company
    @Query("SELECT COUNT(DISTINCT s.question.id) FROM Submission s " +
           "WHERE s.user.id = :userId AND s.question.id IN " +
           "(SELECT cq.question.id FROM CompanyQuestion cq WHERE cq.company.id = :companyId)")
    Long countSolvedQuestionsByUserForCompany(@Param("userId") Integer userId, @Param("companyId") Integer companyId);
}   