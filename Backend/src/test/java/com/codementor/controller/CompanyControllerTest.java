package com.codementor.controller;

import com.codementor.dto.CompanyDTO;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.dto.QuestionDetailsDTO;
import com.codementor.service.CompanyService;
import com.codementor.service.CompanyQuestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CompanyControllerTest {

    @Mock
    private CompanyService companyService;

    @Mock
    private CompanyQuestionService companyQuestionService;

    @InjectMocks
    private CompanyController companyController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllCompanies() {
        List<CompanyDTO> companies = Arrays.asList(new CompanyDTO(), new CompanyDTO());
        when(companyService.getAllCompanies()).thenReturn(companies);
        ResponseEntity<List<CompanyDTO>> response = companyController.getAllCompanies();
        assertEquals(companies, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetAllCompaniesPaginated() {
        Page<CompanyDTO> page = new PageImpl<>(Arrays.asList(new CompanyDTO()));
        Pageable pageable = mock(Pageable.class);
        when(companyService.getAllCompanies(pageable)).thenReturn(page);
        ResponseEntity<Page<CompanyDTO>> response = companyController.getAllCompaniesPaginated(pageable);
        assertEquals(page, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetCompanyById() {
        CompanyDTO company = new CompanyDTO();
        when(companyService.getCompanyById(1)).thenReturn(company);
        ResponseEntity<CompanyDTO> response = companyController.getCompanyById(1);
        assertEquals(company, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetCompanyQuestions() {
        List<CompanyQuestionDTO> questions = Arrays.asList(new CompanyQuestionDTO());
        when(companyQuestionService.getCompanyQuestions(1)).thenReturn(questions);
        ResponseEntity<List<CompanyQuestionDTO>> response = companyController.getCompanyQuestions(1);
        assertEquals(questions, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetCompanyQuestionsPaginated() {
        Page<CompanyQuestionDTO> page = new PageImpl<>(Arrays.asList(new CompanyQuestionDTO()));
        Pageable pageable = mock(Pageable.class);
        when(companyQuestionService.getCompanyQuestions(1, pageable)).thenReturn(page);
        ResponseEntity<Page<CompanyQuestionDTO>> response = companyController.getCompanyQuestionsPaginated(1, pageable);
        assertEquals(page, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetCompanyQuestion() {
        CompanyQuestionDTO question = new CompanyQuestionDTO();
        when(companyQuestionService.getCompanyQuestion(1, 2)).thenReturn(question);
        ResponseEntity<CompanyQuestionDTO> response = companyController.getCompanyQuestion(1, 2);
        assertEquals(question, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetQuestionDetails() {
        QuestionDetailsDTO details = new QuestionDetailsDTO();
        when(companyQuestionService.getQuestionDetails(1, 2)).thenReturn(details);
        ResponseEntity<QuestionDetailsDTO> response = companyController.getQuestionDetails(1, 2);
        assertEquals(details, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }
} 