package com.codementor.service;

import com.codementor.domain.Company;
import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyDTO;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyQuestionRepository companyQuestionRepository;

    @InjectMocks
    private CompanyService companyService;

    private Company testCompany1;
    private Company testCompany2;
    private CompanyQuestion testCompanyQuestion1;
    private CompanyQuestion testCompanyQuestion2;
    private CompanyQuestion testCompanyQuestion3;
    private static final Integer TEST_COMPANY_ID_1 = 1;
    private static final Integer TEST_COMPANY_ID_2 = 2;
    private static final String TEST_COMPANY_NAME_1 = "Test Company 1";
    private static final String TEST_COMPANY_NAME_2 = "Test Company 2";

    @BeforeEach
    void setUp() {
        testCompany1 = new Company();
        testCompany1.setId(TEST_COMPANY_ID_1);
        testCompany1.setName(TEST_COMPANY_NAME_1);
        testCompany1.setLogoUrl("https://example.com/logo1.png");
        testCompany1.setCountry("USA");
        testCompany1.setDescription("Test company 1 description");

        testCompany2 = new Company();
        testCompany2.setId(TEST_COMPANY_ID_2);
        testCompany2.setName(TEST_COMPANY_NAME_2);
        testCompany2.setLogoUrl("https://example.com/logo2.png");
        testCompany2.setCountry("Canada");
        testCompany2.setDescription("Test company 2 description");

        testCompanyQuestion1 = new CompanyQuestion();
        testCompanyQuestion1.setId(1);
        testCompanyQuestion2 = new CompanyQuestion();
        testCompanyQuestion2.setId(2);
        testCompanyQuestion3 = new CompanyQuestion();
        testCompanyQuestion3.setId(3);
    }

    @Test
    void getAllCompanies_Success() {
        // Arrange
        List<Company> companies = Arrays.asList(testCompany1, testCompany2);
        when(companyRepository.findAll()).thenReturn(companies);
        when(companyQuestionRepository.findByCompanyId(TEST_COMPANY_ID_1)).thenReturn(Arrays.asList());
        when(companyQuestionRepository.findByCompanyId(TEST_COMPANY_ID_2)).thenReturn(Arrays.asList());

        // Act
        List<CompanyDTO> result = companyService.getAllCompanies();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        CompanyDTO dto1 = result.get(0);
        assertEquals(TEST_COMPANY_ID_1, dto1.getId());
        assertEquals(TEST_COMPANY_NAME_1, dto1.getName());
        assertEquals("https://example.com/logo1.png", dto1.getLogoUrl());
        assertEquals("USA", dto1.getCountry());
        assertEquals("Test company 1 description", dto1.getDescription());
        assertEquals(0, dto1.getTotalQuestions());
        assertEquals(0, dto1.getSolvedQuestions());

        CompanyDTO dto2 = result.get(1);
        assertEquals(TEST_COMPANY_ID_2, dto2.getId());
        assertEquals(TEST_COMPANY_NAME_2, dto2.getName());
        assertEquals("https://example.com/logo2.png", dto2.getLogoUrl());
        assertEquals("Canada", dto2.getCountry());
        assertEquals("Test company 2 description", dto2.getDescription());
        assertEquals(0, dto2.getTotalQuestions());
        assertEquals(0, dto2.getSolvedQuestions());

        verify(companyRepository).findAll();
        verify(companyQuestionRepository).findByCompanyId(TEST_COMPANY_ID_1);
        verify(companyQuestionRepository).findByCompanyId(TEST_COMPANY_ID_2);
    }

    @Test
    void getAllCompanies_WithQuestions_Success() {
        // Arrange
        List<Company> companies = Arrays.asList(testCompany1);
        when(companyRepository.findAll()).thenReturn(companies);
        when(companyQuestionRepository.findByCompanyId(TEST_COMPANY_ID_1)).thenReturn(Arrays.asList(testCompanyQuestion1, testCompanyQuestion2));

        // Act
        List<CompanyDTO> result = companyService.getAllCompanies();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getTotalQuestions());
        verify(companyRepository).findAll();
        verify(companyQuestionRepository).findByCompanyId(TEST_COMPANY_ID_1);
    }

    @Test
    void getCompanyById_Success() {
        // Arrange
        when(companyRepository.findById(TEST_COMPANY_ID_1)).thenReturn(Optional.of(testCompany1));
        when(companyQuestionRepository.findByCompanyId(TEST_COMPANY_ID_1)).thenReturn(Arrays.asList());

        // Act
        CompanyDTO result = companyService.getCompanyById(TEST_COMPANY_ID_1);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_COMPANY_ID_1, result.getId());
        assertEquals(TEST_COMPANY_NAME_1, result.getName());
        assertEquals("https://example.com/logo1.png", result.getLogoUrl());
        assertEquals("USA", result.getCountry());
        assertEquals("Test company 1 description", result.getDescription());
        assertEquals(0, result.getTotalQuestions());
        assertEquals(0, result.getSolvedQuestions());

        verify(companyRepository).findById(TEST_COMPANY_ID_1);
        verify(companyQuestionRepository).findByCompanyId(TEST_COMPANY_ID_1);
    }

    @Test
    void getCompanyById_NotFound_ThrowsException() {
        // Arrange
        when(companyRepository.findById(TEST_COMPANY_ID_1)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> companyService.getCompanyById(TEST_COMPANY_ID_1));
        
        assertEquals("Company not found", exception.getMessage());
        verify(companyRepository).findById(TEST_COMPANY_ID_1);
        verify(companyQuestionRepository, never()).findByCompanyId(anyInt());
    }

    @Test
    void getCompanyById_WithQuestions_Success() {
        // Arrange
        when(companyRepository.findById(TEST_COMPANY_ID_1)).thenReturn(Optional.of(testCompany1));
        when(companyQuestionRepository.findByCompanyId(TEST_COMPANY_ID_1)).thenReturn(Arrays.asList(testCompanyQuestion1, testCompanyQuestion2, testCompanyQuestion3));

        // Act
        CompanyDTO result = companyService.getCompanyById(TEST_COMPANY_ID_1);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getTotalQuestions());
        assertEquals(0, result.getSolvedQuestions());
        verify(companyRepository).findById(TEST_COMPANY_ID_1);
        verify(companyQuestionRepository).findByCompanyId(TEST_COMPANY_ID_1);
    }
} 