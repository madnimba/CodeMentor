package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.repository.CompanyQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class CompanyQuestionService {
    
    private static final Logger logger = LoggerFactory.getLogger(CompanyQuestionService.class);
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    public List<CompanyQuestionDTO> getCompanyQuestions(Integer companyId) {
        logger.info("Fetching questions for company ID: {}", companyId);
        List<CompanyQuestion> questions = companyQuestionRepository.findByCompanyId(companyId);
        logger.info("Found {} questions for company ID: {}", questions.size(), companyId);
        
        List<CompanyQuestionDTO> dtos = questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        logger.info("Converted {} questions to DTOs", dtos.size());
        return dtos;
    }

    public CompanyQuestionDTO getCompanyQuestion(Integer companyId, Integer questionId) {
        CompanyQuestion question = companyQuestionRepository.findByCompanyIdAndQuestionId(companyId, questionId);
        if (question == null) {
            throw new RuntimeException("Question not found for this company");
        }
        return convertToDTO(question);
    }

    private CompanyQuestionDTO convertToDTO(CompanyQuestion companyQuestion) {
        try {
            CompanyQuestionDTO dto = new CompanyQuestionDTO();
            dto.setId(companyQuestion.getQuestion().getId());
            dto.setTitle(companyQuestion.getQuestion().getTitle());
            dto.setDescription(companyQuestion.getQuestion().getDescription());
            
            // Add null check for difficulty
            if (companyQuestion.getQuestion().getDifficulty() != null) {
                dto.setDifficulty(companyQuestion.getQuestion().getDifficulty().name());
            } else {
                dto.setDifficulty("Medium"); // Default difficulty
            }
            
            dto.setYear(companyQuestion.getYear());
            dto.setPosition(companyQuestion.getPosition());
            
            // TODO: Implement status and tags when user progress tracking is implemented
            dto.setStatus("unsolved");
            dto.setTags(new String[]{"Array", "Hash Table"}); // Placeholder tags
            
            // TODO: Implement solution when question content is available
            dto.setSolution("// Solution will be available soon");
            
            return dto;
        } catch (Exception e) {
            logger.error("Error converting CompanyQuestion to DTO: {}", e.getMessage(), e);
            throw e;
        }
    }
}