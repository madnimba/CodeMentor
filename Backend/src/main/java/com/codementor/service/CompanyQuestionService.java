package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.QuestionSolutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyQuestionService {
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    @Autowired
    private QuestionSolutionRepository questionSolutionRepository;

    public List<CompanyQuestionDTO> getCompanyQuestions(Integer companyId) {
        List<CompanyQuestion> questions = companyQuestionRepository.findByCompanyId(companyId);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Page<CompanyQuestionDTO> getCompanyQuestions(Integer companyId, Pageable pageable) {
        Page<CompanyQuestion> questions = companyQuestionRepository.findByCompanyId(companyId, pageable);
        return questions.map(this::convertToDTO);
    }

    public CompanyQuestionDTO getCompanyQuestion(Integer companyId, Integer questionId) {
        CompanyQuestion question = companyQuestionRepository.findByCompanyIdAndQuestionId(companyId, questionId);
        if (question == null) {
            throw new RuntimeException("Question not found for this company");
        }
        return convertToDTO(question);
    }

    private CompanyQuestionDTO convertToDTO(CompanyQuestion companyQuestion) {
        CompanyQuestionDTO dto = new CompanyQuestionDTO();
        dto.setId(companyQuestion.getQuestion().getId());
        dto.setTitle(companyQuestion.getQuestion().getTitle());
        dto.setDescription(companyQuestion.getQuestion().getDescription());
        dto.setDifficulty(companyQuestion.getQuestion().getDifficulty().name());
        dto.setYear(companyQuestion.getYear());
        dto.setPosition(companyQuestion.getPosition());
        
        // TODO: Implement status and tags when user progress tracking is implemented
        dto.setStatus("unsolved");
        dto.setTags(new String[]{"Array", "Hash Table"}); // Placeholder tags
        
        // Fetch only the first solution code for the question
        String code = questionSolutionRepository.findFirstCodeByQuestionId(companyQuestion.getQuestion().getId());
        if (code != null) {
            dto.setSolution(code);
        } else {
            dto.setSolution("Solution will be available soon"); // Or set to "Solution will be available soon" if you prefer
        }

        // System.out.println("got dto: " + dto.getTitle());
        
        return dto;
    }
}