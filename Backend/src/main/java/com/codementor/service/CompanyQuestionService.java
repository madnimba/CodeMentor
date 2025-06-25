package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.repository.CompanyQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyQuestionService {
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    public List<CompanyQuestionDTO> getCompanyQuestions(Integer companyId) {
        List<CompanyQuestion> questions = companyQuestionRepository.findByCompanyId(companyId);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
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
        
        // TODO: Implement solution when question content is available
        dto.setSolution("Solution will be available soon");

        // System.out.println("got dto: " + dto.getTitle());
        
        return dto;
    }
}