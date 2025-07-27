package com.codementor.repository;

import com.codementor.domain.Company;
import com.codementor.domain.CompanyQuestion;
import com.codementor.domain.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class CompanyQuestionRepositoryTest {

    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Company testCompany1;
    private Company testCompany2;
    private Question testQuestion1;
    private Question testQuestion2;
    private Question testQuestion3;
    private CompanyQuestion testCompanyQuestion1;
    private CompanyQuestion testCompanyQuestion2;
    private CompanyQuestion testCompanyQuestion3;

    @BeforeEach
    void setUp() {
        // Create test companies
        testCompany1 = new Company();
        testCompany1.setName("Google");
        testCompany1.setCountry("USA");
        testCompany1.setDescription("Tech giant");
        testCompany1.setLogoUrl("https://example.com/google.png");
        testCompany1 = entityManager.persistAndFlush(testCompany1);

        testCompany2 = new Company();
        testCompany2.setName("Microsoft");
        testCompany2.setCountry("USA");
        testCompany2.setDescription("Software company");
        testCompany2.setLogoUrl("https://example.com/microsoft.png");
        testCompany2 = entityManager.persistAndFlush(testCompany2);

        // Create test questions
        testQuestion1 = new Question();
        testQuestion1.setTitle("Two Sum");
        testQuestion1.setDescription("Find two numbers that add up to target");
        testQuestion1.setDifficulty(Question.Difficulty.Easy);
        testQuestion1.setSlug("two-sum");
        testQuestion1.setContentFingerprint("fingerprint1");
        testQuestion1 = entityManager.persistAndFlush(testQuestion1);

        testQuestion2 = new Question();
        testQuestion2.setTitle("Reverse Linked List");
        testQuestion2.setDescription("Reverse a singly linked list");
        testQuestion2.setDifficulty(Question.Difficulty.Medium);
        testQuestion2.setSlug("reverse-linked-list");
        testQuestion2.setContentFingerprint("fingerprint2");
        testQuestion2 = entityManager.persistAndFlush(testQuestion2);

        testQuestion3 = new Question();
        testQuestion3.setTitle("Binary Tree Maximum Path Sum");
        testQuestion3.setDescription("Find the maximum path sum in a binary tree");
        testQuestion3.setDifficulty(Question.Difficulty.Hard);
        testQuestion3.setSlug("binary-tree-maximum-path-sum");
        testQuestion3.setContentFingerprint("fingerprint3");
        testQuestion3 = entityManager.persistAndFlush(testQuestion3);

        // Create test company questions
        testCompanyQuestion1 = new CompanyQuestion();
        testCompanyQuestion1.setCompany(testCompany1);
        testCompanyQuestion1.setQuestion(testQuestion1);
        testCompanyQuestion1.setYear(2023);
        testCompanyQuestion1.setPosition("Software Engineer");
        testCompanyQuestion1 = entityManager.persistAndFlush(testCompanyQuestion1);

        testCompanyQuestion2 = new CompanyQuestion();
        testCompanyQuestion2.setCompany(testCompany1);
        testCompanyQuestion2.setQuestion(testQuestion2);
        testCompanyQuestion2.setYear(2023);
        testCompanyQuestion2.setPosition("Senior Software Engineer");
        testCompanyQuestion2 = entityManager.persistAndFlush(testCompanyQuestion2);

        testCompanyQuestion3 = new CompanyQuestion();
        testCompanyQuestion3.setCompany(testCompany2);
        testCompanyQuestion3.setQuestion(testQuestion3);
        testCompanyQuestion3.setYear(2024);
        testCompanyQuestion3.setPosition("Principal Engineer");
        testCompanyQuestion3 = entityManager.persistAndFlush(testCompanyQuestion3);

        entityManager.clear();
    }

    @Test
    void findByCompanyId_CompanyHasQuestions_ReturnsListWithQuestions() {
        // Act
        List<CompanyQuestion> companyQuestions = companyQuestionRepository.findByCompanyId(testCompany1.getId());

        // Assert
        assertNotNull(companyQuestions);
        assertEquals(2, companyQuestions.size());
        
        // Verify questions are fetched (JOIN FETCH)
        for (CompanyQuestion cq : companyQuestions) {
            assertNotNull(cq.getQuestion());
            assertNotNull(cq.getQuestion().getTitle());
        }
        
        // Verify correct questions are returned
        assertTrue(companyQuestions.stream().anyMatch(cq -> cq.getQuestion().getTitle().equals("Two Sum")));
        assertTrue(companyQuestions.stream().anyMatch(cq -> cq.getQuestion().getTitle().equals("Reverse Linked List")));
    }

    @Test
    void findByCompanyId_CompanyHasNoQuestions_ReturnsEmptyList() {
        // Arrange
        Company emptyCompany = new Company();
        emptyCompany.setName("Empty Company");
        emptyCompany.setCountry("USA");
        emptyCompany.setDescription("No questions");
        emptyCompany.setLogoUrl("https://example.com/empty.png");
        emptyCompany = entityManager.persistAndFlush(emptyCompany);

        // Act
        List<CompanyQuestion> companyQuestions = companyQuestionRepository.findByCompanyId(emptyCompany.getId());

        // Assert
        assertNotNull(companyQuestions);
        assertTrue(companyQuestions.isEmpty());
    }

    @Test
    void findByCompanyId_WithPageable_ReturnsPagedResults() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 1);

        // Act
        Page<CompanyQuestion> companyQuestionsPage = companyQuestionRepository.findByCompanyId(testCompany1.getId(), pageable);

        // Assert
        assertNotNull(companyQuestionsPage);
        assertEquals(1, companyQuestionsPage.getContent().size());
        assertEquals(2, companyQuestionsPage.getTotalElements());
        assertEquals(2, companyQuestionsPage.getTotalPages());
        
        // Verify question is fetched (JOIN FETCH)
        CompanyQuestion cq = companyQuestionsPage.getContent().get(0);
        assertNotNull(cq.getQuestion());
        assertNotNull(cq.getQuestion().getTitle());
    }

    @Test
    void findByCompanyId_WithPageable_SecondPage_ReturnsCorrectResults() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 1);

        // Act
        Page<CompanyQuestion> companyQuestionsPage = companyQuestionRepository.findByCompanyId(testCompany1.getId(), pageable);

        // Assert
        assertNotNull(companyQuestionsPage);
        assertEquals(1, companyQuestionsPage.getContent().size());
        assertEquals(2, companyQuestionsPage.getTotalElements());
        assertEquals(2, companyQuestionsPage.getTotalPages());
    }

    @Test
    void findByCompanyIdAndQuestionId_Exists_ReturnsCompanyQuestion() {
        // Act
        CompanyQuestion found = companyQuestionRepository.findByCompanyIdAndQuestionId(
                testCompany1.getId(), testQuestion1.getId());

        // Assert
        assertNotNull(found);
        assertEquals(testCompany1.getId(), found.getCompany().getId());
        assertEquals(testQuestion1.getId(), found.getQuestion().getId());
        assertEquals(2023, found.getYear());
        assertEquals("Software Engineer", found.getPosition());
    }

    @Test
    void findByCompanyIdAndQuestionId_NotExists_ReturnsNull() {
        // Act
        CompanyQuestion found = companyQuestionRepository.findByCompanyIdAndQuestionId(
                testCompany1.getId(), testQuestion3.getId());

        // Assert
        assertNull(found);
    }

    @Test
    void countByCompanyId_CompanyHasQuestions_ReturnsCorrectCount() {
        // Act
        long count = companyQuestionRepository.countByCompanyId(testCompany1.getId());

        // Assert
        assertEquals(2L, count);
    }

    @Test
    void countByCompanyId_CompanyHasNoQuestions_ReturnsZero() {
        // Arrange
        Company emptyCompany = new Company();
        emptyCompany.setName("Empty Company");
        emptyCompany.setCountry("USA");
        emptyCompany.setDescription("No questions");
        emptyCompany.setLogoUrl("https://example.com/empty.png");
        emptyCompany = entityManager.persistAndFlush(emptyCompany);

        // Act
        long count = companyQuestionRepository.countByCompanyId(emptyCompany.getId());

        // Assert
        assertEquals(0L, count);
    }

    @Test
    void countByCompanyId_NonExistentCompany_ReturnsZero() {
        // Act
        long count = companyQuestionRepository.countByCompanyId(999);

        // Assert
        assertEquals(0L, count);
    }

    @Test
    void save_NewCompanyQuestion_SavesSuccessfully() {
        // Arrange
        CompanyQuestion newCompanyQuestion = new CompanyQuestion();
        newCompanyQuestion.setCompany(testCompany2);
        newCompanyQuestion.setQuestion(testQuestion1);
        newCompanyQuestion.setYear(2024);
        newCompanyQuestion.setPosition("Staff Engineer");

        // Act
        CompanyQuestion saved = companyQuestionRepository.save(newCompanyQuestion);

        // Assert
        assertNotNull(saved.getId());
        assertEquals(testCompany2.getId(), saved.getCompany().getId());
        assertEquals(testQuestion1.getId(), saved.getQuestion().getId());
        assertEquals(2024, saved.getYear());
        assertEquals("Staff Engineer", saved.getPosition());
    }

    @Test
    void findAll_ReturnsAllCompanyQuestions() {
        // Act
        List<CompanyQuestion> all = companyQuestionRepository.findAll();

        // Assert
        assertEquals(3, all.size());
    }

    @Test
    void delete_ExistingCompanyQuestion_DeletesSuccessfully() {
        // Act
        companyQuestionRepository.delete(testCompanyQuestion1);

        // Assert
        long count = companyQuestionRepository.countByCompanyId(testCompany1.getId());
        assertEquals(1L, count); // Should be 1 remaining question for company1
    }
} 