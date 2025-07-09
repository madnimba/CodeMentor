package com.codementor.repository;

import com.codementor.domain.Company;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class CompanyRepositoryTest {

    @Autowired
    private CompanyRepository companyRepository;

    private Company testCompany1;
    private Company testCompany2;

    @BeforeEach
    void setUp() {
        testCompany1 = new Company();
        testCompany1.setName("Google");
        testCompany1.setCountry("USA");
        testCompany1.setDescription("Tech giant");
        testCompany1.setLogoUrl("https://example.com/google.png");

        testCompany2 = new Company();
        testCompany2.setName("Microsoft");
        testCompany2.setCountry("USA");
        testCompany2.setDescription("Software company");
        testCompany2.setLogoUrl("https://example.com/microsoft.png");
    }

    @Test
    void findByName_CompanyExists_ReturnsCompany() {
        // Arrange
        companyRepository.save(testCompany1);

        // Act
        Company foundCompany = companyRepository.findByName("Google");

        // Assert
        assertNotNull(foundCompany);
        assertEquals("Google", foundCompany.getName());
        assertEquals("USA", foundCompany.getCountry());
        assertEquals("Tech giant", foundCompany.getDescription());
        assertEquals("https://example.com/google.png", foundCompany.getLogoUrl());
    }

    @Test
    void findByName_CompanyDoesNotExist_ReturnsNull() {
        // Act
        Company foundCompany = companyRepository.findByName("NonExistentCompany");

        // Assert
        assertNull(foundCompany);
    }

    @Test
    void findByName_CaseSensitive_ReturnsNull() {
        // Arrange
        companyRepository.save(testCompany1);

        // Act
        Company foundCompany = companyRepository.findByName("google"); // lowercase

        // Assert
        assertNull(foundCompany);
    }

    @Test
    void findAll_MultipleCompanies_ReturnsAllCompanies() {
        // Arrange
        companyRepository.save(testCompany1);
        companyRepository.save(testCompany2);

        // Act
        List<Company> companies = companyRepository.findAll();

        // Assert
        assertEquals(2, companies.size());
        assertTrue(companies.stream().anyMatch(c -> c.getName().equals("Google")));
        assertTrue(companies.stream().anyMatch(c -> c.getName().equals("Microsoft")));
    }

    @Test
    void findById_CompanyExists_ReturnsCompany() {
        // Arrange
        Company savedCompany = companyRepository.save(testCompany1);

        // Act
        Optional<Company> foundCompany = companyRepository.findById(savedCompany.getId());

        // Assert
        assertTrue(foundCompany.isPresent());
        assertEquals("Google", foundCompany.get().getName());
    }

    @Test
    void findById_CompanyDoesNotExist_ReturnsEmpty() {
        // Act
        Optional<Company> foundCompany = companyRepository.findById(999);

        // Assert
        assertFalse(foundCompany.isPresent());
    }

    @Test
    void save_NewCompany_SavesSuccessfully() {
        // Act
        Company savedCompany = companyRepository.save(testCompany1);

        // Assert
        assertNotNull(savedCompany.getId());
        assertEquals("Google", savedCompany.getName());
        assertEquals("USA", savedCompany.getCountry());
        assertEquals("Tech giant", savedCompany.getDescription());
        assertEquals("https://example.com/google.png", savedCompany.getLogoUrl());
    }

    @Test
    void save_UpdateExistingCompany_UpdatesSuccessfully() {
        // Arrange
        Company savedCompany = companyRepository.save(testCompany1);
        savedCompany.setDescription("Updated description");

        // Act
        Company updatedCompany = companyRepository.save(savedCompany);

        // Assert
        assertEquals(savedCompany.getId(), updatedCompany.getId());
        assertEquals("Updated description", updatedCompany.getDescription());
    }

    @Test
    void delete_ExistingCompany_DeletesSuccessfully() {
        // Arrange
        Company savedCompany = companyRepository.save(testCompany1);

        // Act
        companyRepository.delete(savedCompany);

        // Assert
        Optional<Company> foundCompany = companyRepository.findById(savedCompany.getId());
        assertFalse(foundCompany.isPresent());
    }

    @Test
    void count_MultipleCompanies_ReturnsCorrectCount() {
        // Arrange
        companyRepository.save(testCompany1);
        companyRepository.save(testCompany2);

        // Act
        long count = companyRepository.count();

        // Assert
        assertEquals(2, count);
    }

    @Test
    void existsById_CompanyExists_ReturnsTrue() {
        // Arrange
        Company savedCompany = companyRepository.save(testCompany1);

        // Act
        boolean exists = companyRepository.existsById(savedCompany.getId());

        // Assert
        assertTrue(exists);
    }

    @Test
    void existsById_CompanyDoesNotExist_ReturnsFalse() {
        // Act
        boolean exists = companyRepository.existsById(999);

        // Assert
        assertFalse(exists);
    }
} 