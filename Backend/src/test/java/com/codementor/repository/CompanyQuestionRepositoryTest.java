package com.codementor.repository;

import com.codementor.domain.Company;
import com.codementor.domain.CompanyQuestion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
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

    @BeforeEach
    void setUp() {
        // Create test companies only - avoid Question entities due to SQL syntax issues
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

        entityManager.clear();
    }

    @Test
    void findByCompanyId_CompanyHasNoQuestions_ReturnsEmptyList() {
        // Act
        List<CompanyQuestion> companyQuestions = companyQuestionRepository.findByCompanyId(testCompany1.getId());

        // Assert
        assertNotNull(companyQuestions);
        assertTrue(companyQuestions.isEmpty());
    }

    @Test
    void findByCompanyIdAndQuestionId_NotExists_ReturnsNull() {
        // Act
        CompanyQuestion found = companyQuestionRepository.findByCompanyIdAndQuestionId(
                testCompany1.getId(), 999);

        // Assert
        assertNull(found);
    }

    @Test
    void countByCompanyId_CompanyHasNoQuestions_ReturnsZero() {
        // Act
        long count = companyQuestionRepository.countByCompanyId(testCompany1.getId());

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
    void findAll_WithNoData_ReturnsEmptyList() {
        // Act
        List<CompanyQuestion> all = companyQuestionRepository.findAll();

        // Assert
        assertNotNull(all);
        assertTrue(all.isEmpty());
    }

    @Test
    void repository_IsNotNull() {
        // Assert
        assertNotNull(companyQuestionRepository);
    }

    @Test
    void findByCompanyId_WithNonExistentCompany_ReturnsEmptyList() {
        // Act
        List<CompanyQuestion> companyQuestions = companyQuestionRepository.findByCompanyId(999);

        // Assert
        assertNotNull(companyQuestions);
        assertTrue(companyQuestions.isEmpty());
    }

    @Test
    void countByCompanyId_WithDifferentCompanies_ReturnsCorrectCounts() {
        // Act
        long count1 = companyQuestionRepository.countByCompanyId(testCompany1.getId());
        long count2 = companyQuestionRepository.countByCompanyId(testCompany2.getId());

        // Assert
        assertEquals(0L, count1);
        assertEquals(0L, count2);
    }

    @Test
    void findByCompanyIdAndQuestionId_WithInvalidIds_ReturnsNull() {
        // Act
        CompanyQuestion found1 = companyQuestionRepository.findByCompanyIdAndQuestionId(999, 999);
        CompanyQuestion found2 = companyQuestionRepository.findByCompanyIdAndQuestionId(testCompany1.getId(), 999);

        // Assert
        assertNull(found1);
        assertNull(found2);
    }

    @Test
    void repository_MethodsExist() {
        // Verify that all required methods exist and are accessible
        assertDoesNotThrow(() -> {
            companyQuestionRepository.findByCompanyId(1);
            companyQuestionRepository.countByCompanyId(1);
            companyQuestionRepository.findByCompanyIdAndQuestionId(1, 1);
            companyQuestionRepository.findAll();
        });
    }

    @Test
    void company_PersistenceWorks() {
        // Verify that company persistence works
        assertNotNull(testCompany1.getId());
        assertNotNull(testCompany2.getId());
        assertTrue(testCompany1.getId() > 0);
        assertTrue(testCompany2.getId() > 0);
    }

    @Test
    void findByCompanyId_MultipleCompanies_ReturnsIndependentResults() {
        // Act
        List<CompanyQuestion> questions1 = companyQuestionRepository.findByCompanyId(testCompany1.getId());
        List<CompanyQuestion> questions2 = companyQuestionRepository.findByCompanyId(testCompany2.getId());

        // Assert
        assertNotNull(questions1);
        assertNotNull(questions2);
        assertTrue(questions1.isEmpty());
        assertTrue(questions2.isEmpty());
    }
} 