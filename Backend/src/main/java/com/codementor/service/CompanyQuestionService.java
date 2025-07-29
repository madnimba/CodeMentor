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
import java.util.ArrayList;
import java.util.Arrays;
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

    public List<CompanyQuestionDTO> getCompanyCodingQuestions(Integer companyId) {
        List<CompanyQuestion> questions = companyQuestionRepository.findByCompanyIdAndQuestionIsCodingTrue(companyId);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Page<CompanyQuestionDTO> getCompanyCodingQuestions(Integer companyId, Pageable pageable) {
        Page<CompanyQuestion> questions = companyQuestionRepository.findByCompanyIdAndQuestionIsCodingTrue(companyId, pageable);
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
                    dto.setQuestion_year(q.getQuestion_year());
        if (q.getTrack() != null) {
            QuestionDetailsDTO.TrackDTO trackDTO = new QuestionDetailsDTO.TrackDTO();
            trackDTO.setId(q.getTrack().getId());
            trackDTO.setName(q.getTrack().getName());
            dto.setTrack(trackDTO);
        }
        // Fetch testcases
        List<Testcase> testcases = testcaseRepository.findByQuestionId(q.getId());
        List<QuestionDetailsDTO.TestcaseDTO> testcaseDTOs = testcases.stream().map(tc -> {
            QuestionDetailsDTO.TestcaseDTO t = new QuestionDetailsDTO.TestcaseDTO();
            t.setId(tc.getId());
            t.setTest1(tc.getTest1());
            t.setOutput1(tc.getOutput1());
            t.setTest2(tc.getTest2());
            t.setOutput2(tc.getOutput2());
            t.setTest3(tc.getTest3());
            t.setOutput3(tc.getOutput3());
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
                    dto.setQuestion_year(companyQuestion.getQuestion().getQuestion_year());
        dto.setPosition(companyQuestion.getPosition());
        dto.setIsCoding(companyQuestion.getQuestion().getIsCoding());
        
        // TODO: Implement status and tags when user progress tracking is implemented
        dto.setStatus("unsolved");
        
        // Generate meaningful tags based on question properties
        List<String> tags = new ArrayList<>();
        
        // Add track-based tags
        if (companyQuestion.getQuestion().getTrack() != null) {
            String trackName = companyQuestion.getQuestion().getTrack().getName();
            tags.add(trackName);
            
            // Add specific tags based on track
            switch (trackName.toLowerCase()) {
                case "data structures":
                    tags.addAll(Arrays.asList("Array", "Linked List", "Stack", "Queue", "Tree", "Graph"));
                    break;
                case "algorithms":
                    tags.addAll(Arrays.asList("Sorting", "Searching", "Dynamic Programming", "Greedy"));
                    break;
                case "database systems":
                    tags.addAll(Arrays.asList("SQL", "Database", "Query Optimization"));
                    break;
                case "system design":
                    tags.addAll(Arrays.asList("System Design", "Scalability", "Architecture"));
                    break;
                default:
                    tags.add("General");
            }
        }
        
        // Add subtopic-based tags
        if (companyQuestion.getQuestion().getSubtopic() != null) {
            tags.add(companyQuestion.getQuestion().getSubtopic().getName());
        }
        
        // Add difficulty-based tags
        tags.add(companyQuestion.getQuestion().getDifficulty().name());
        
        // Add importance tag if available
        if (companyQuestion.getQuestion().getImportanceTag() != null && 
            !companyQuestion.getQuestion().getImportanceTag().isEmpty()) {
            tags.add(companyQuestion.getQuestion().getImportanceTag());
        }
        
        // Remove duplicates and convert to array
        dto.setTags(tags.stream().distinct().toArray(String[]::new));
        
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