package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.QuestionSolutionRepository;
import com.codementor.repository.TestcaseRepository;
import com.codementor.repository.HintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.codementor.dto.QuestionDetailsDTO;
import com.codementor.domain.Question;
import com.codementor.domain.Track;
import com.codementor.domain.Testcase;
import com.codementor.domain.Hint;

@Service
@Transactional
public class CompanyQuestionService {
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    @Autowired
    private QuestionSolutionRepository questionSolutionRepository;

    @Autowired
    private TestcaseRepository testcaseRepository;

    @Autowired
    private HintRepository hintRepository;

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

    public QuestionDetailsDTO getQuestionDetails(Integer companyId, Integer questionId) {
        CompanyQuestion companyQuestion = companyQuestionRepository.findByCompanyIdAndQuestionId(companyId, questionId);
        if (companyQuestion == null) {
            throw new RuntimeException("Question not found for this company");
        }
        Question q = companyQuestion.getQuestion();
        QuestionDetailsDTO dto = new QuestionDetailsDTO();
        dto.setTitle(q.getTitle());
        dto.setDescription(q.getDescription());
        dto.setDifficulty(q.getDifficulty().name());
        dto.setImportanceTag(q.getImportanceTag());
        dto.setUpvotes(q.getUpvotes());
        dto.setDownvotes(q.getDownvotes());
        if (q.getTrack() != null) {
            QuestionDetailsDTO.TrackDTO trackDTO = new QuestionDetailsDTO.TrackDTO();
            trackDTO.setId(q.getTrack().getId());
            trackDTO.setName(q.getTrack().getName());
            dto.setTrack(trackDTO);
        }
        // Fetch public testcases
        List<Testcase> testcases = testcaseRepository.findByQuestionIdAndIsPublicTrueOrderByIdAsc(q.getId());
        List<QuestionDetailsDTO.TestcaseDTO> testcaseDTOs = testcases.stream().map(tc -> {
            QuestionDetailsDTO.TestcaseDTO t = new QuestionDetailsDTO.TestcaseDTO();
            t.setId(tc.getId());
            t.setInput(tc.getInput());
            t.setExpectedOutput(tc.getExpectedOutput());
            t.setTimeLimitMs(tc.getTimeLimitMs());
            return t;
        }).toList();
        dto.setTestcases(testcaseDTOs);
        // Fetch hints
        List<Hint> hints = hintRepository.findByQuestionIdOrderByHintOrderAsc(q.getId());
        List<QuestionDetailsDTO.HintDTO> hintDTOs = hints.stream().map(h -> {
            QuestionDetailsDTO.HintDTO hd = new QuestionDetailsDTO.HintDTO();
            hd.setId(h.getId());
            hd.setContent(h.getContent());
            hd.setHintOrder(h.getHintOrder());
            return hd;
        }).toList();
        dto.setHints(hintDTOs);
        return dto;
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