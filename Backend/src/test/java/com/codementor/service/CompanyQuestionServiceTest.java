package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.domain.Question;
import com.codementor.domain.Testcase;
import com.codementor.domain.Hint;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.dto.QuestionDetailsDTO;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.QuestionSolutionRepository;
import com.codementor.repository.TestcaseRepository;
import com.codementor.repository.HintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CompanyQuestionServiceTest {
    @Mock
    private CompanyQuestionRepository companyQuestionRepository;
    @Mock
    private QuestionSolutionRepository questionSolutionRepository;
    @Mock
    private TestcaseRepository testcaseRepository;
    @Mock
    private HintRepository hintRepository;

    @InjectMocks
    private CompanyQuestionService companyQuestionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetCompanyQuestions() {
        CompanyQuestion cq = mock(CompanyQuestion.class);
        Question question = new Question();
        question.setDifficulty(Question.Difficulty.Easy);
        when(companyQuestionRepository.findByCompanyId(1)).thenReturn(Arrays.asList(cq));
        when(cq.getQuestion()).thenReturn(question);
        when(questionSolutionRepository.findFirstCodeByQuestionId(anyInt())).thenReturn("code");
        List<CompanyQuestionDTO> result = companyQuestionService.getCompanyQuestions(1);
        assertEquals(1, result.size());
    }

    @Test
    void testGetCompanyQuestionsPaginated() {
        CompanyQuestion cq = mock(CompanyQuestion.class);
        Question question = new Question();
        question.setDifficulty(Question.Difficulty.Easy);
        Page<CompanyQuestion> page = new PageImpl<>(Arrays.asList(cq));
        Pageable pageable = mock(Pageable.class);
        when(companyQuestionRepository.findByCompanyId(1, pageable)).thenReturn(page);
        when(cq.getQuestion()).thenReturn(question);
        when(questionSolutionRepository.findFirstCodeByQuestionId(anyInt())).thenReturn("code");
        Page<CompanyQuestionDTO> result = companyQuestionService.getCompanyQuestions(1, pageable);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void testGetCompanyQuestion_Found() {
        CompanyQuestion cq = mock(CompanyQuestion.class);
        Question question = new Question();
        question.setDifficulty(Question.Difficulty.Easy);
        when(companyQuestionRepository.findByCompanyIdAndQuestionId(1, 2)).thenReturn(cq);
        when(cq.getQuestion()).thenReturn(question);
        when(questionSolutionRepository.findFirstCodeByQuestionId(anyInt())).thenReturn("code");
        CompanyQuestionDTO dto = companyQuestionService.getCompanyQuestion(1, 2);
        assertNotNull(dto);
    }

    @Test
    void testGetCompanyQuestion_NotFound() {
        when(companyQuestionRepository.findByCompanyIdAndQuestionId(1, 2)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> companyQuestionService.getCompanyQuestion(1, 2));
    }

    @Test
    void testGetQuestionDetails_Found() {
        CompanyQuestion cq = mock(CompanyQuestion.class);
        Question q = new Question();
        q.setId(1);
        q.setTitle("title");
        q.setDescription("desc");
        q.setDifficulty(Question.Difficulty.Easy);
        q.setImportanceTag("tag");
        q.setUpvotes(1);
        q.setDownvotes(0);
        when(cq.getQuestion()).thenReturn(q);
        when(companyQuestionRepository.findByCompanyIdAndQuestionId(1, 2)).thenReturn(cq);
        when(testcaseRepository.findByQuestionId(1)).thenReturn(Collections.emptyList());
        when(hintRepository.findByQuestionIdOrderByHintOrderAsc(1)).thenReturn(Collections.emptyList());
        QuestionDetailsDTO dto = companyQuestionService.getQuestionDetails(1, 2);
        assertEquals("title", dto.getTitle());
        assertEquals("desc", dto.getDescription());
        assertEquals("Easy", dto.getDifficulty());
    }

    @Test
    void testGetQuestionDetails_NotFound() {
        when(companyQuestionRepository.findByCompanyIdAndQuestionId(1, 2)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> companyQuestionService.getQuestionDetails(1, 2));
    }
} 