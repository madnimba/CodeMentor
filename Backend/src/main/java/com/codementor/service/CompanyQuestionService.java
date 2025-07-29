package com.codementor.service;

import com.codementor.domain.CompanyQuestion;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.QuestionSolutionRepository;
import com.codementor.repository.TestcaseRepository;
import com.codementor.repository.HintRepository;
import com.codementor.repository.SubmissionRepository;
import com.codementor.repository.UserRepository;
import com.codementor.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

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

    // Search company questions
    public Page<CompanyQuestionDTO> searchCompanyQuestions(Integer companyId, String searchTerm, Boolean isCoding, Pageable pageable) {
        Page<CompanyQuestion> questions = companyQuestionRepository.searchCompanyQuestions(companyId, searchTerm, isCoding, pageable);
        return questions.map(this::convertToDTO);
    }

    // Comprehensive filtering for company questions
    public Page<CompanyQuestionDTO> getCompanyQuestionsWithFilters(
            Integer companyId,
            String searchTerm,
            Integer trackId,
            Integer topicId,
            Integer subtopicId,
            String difficulty,
            Short year,
            Boolean isCoding,
            Pageable pageable) {
        
        Question.Difficulty difficultyEnum = null;
        if (difficulty != null && !difficulty.isEmpty()) {
            try {
                difficultyEnum = Question.Difficulty.valueOf(difficulty);
            } catch (IllegalArgumentException e) {
                // Invalid difficulty, ignore
            }
        }
        
        Page<CompanyQuestion> questions = companyQuestionRepository.findCompanyQuestionsWithFilters(
            companyId,
            searchTerm,
            trackId,
            topicId,
            subtopicId,
            difficultyEnum,
            year,
            isCoding,
            pageable
        );
        
        return questions.map(this::convertToDTO);
    }

    public QuestionDetailsDTO getQuestionDetails(Integer companyId, Integer questionId) {
        CompanyQuestion companyQuestion = companyQuestionRepository.findByCompanyIdAndQuestionId(companyId, questionId);
        if (companyQuestion == null) {
            throw new RuntimeException("Question not found for this company");
        }

        Question question = companyQuestion.getQuestion();
        List<Testcase> testcases = testcaseRepository.findByQuestionId(questionId);
        List<Hint> hints = hintRepository.findByQuestionIdOrderByHintOrderAsc(questionId);

        QuestionDetailsDTO dto = new QuestionDetailsDTO();
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty().name());
        dto.setImportanceTag(question.getImportanceTag());
        dto.setQuestion_year(question.getQuestion_year());
        
        // Set track
        if (question.getTrack() != null) {
            QuestionDetailsDTO.TrackDTO trackDTO = new QuestionDetailsDTO.TrackDTO();
            trackDTO.setId(question.getTrack().getId());
            trackDTO.setName(question.getTrack().getName());
            dto.setTrack(trackDTO);
        }
        
        // Convert testcases
        List<QuestionDetailsDTO.TestcaseDTO> testcaseDTOs = testcases.stream()
            .map(this::convertTestcaseToDTO)
            .collect(Collectors.toList());
        dto.setTestcases(testcaseDTOs);
        
        // Convert hints
        List<QuestionDetailsDTO.HintDTO> hintDTOs = hints.stream()
            .map(this::convertHintToDTO)
            .collect(Collectors.toList());
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

        // Check completion status for coding questions only
        if (companyQuestion.getQuestion().getIsCoding()) {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()) {
                    String email = authentication.getName();
                    User currentUser = userRepository.findByEmail(email).orElse(null);
                    
                    if (currentUser != null) {
                        // Check if user has an accepted submission for this coding question
                        List<com.codementor.domain.Submission> acceptedSubmissions = submissionRepository.findByUserIdAndQuestionIdAndStatusOrderBySubmittedAtDesc(
                            currentUser.getId(), companyQuestion.getQuestion().getId(), "accepted");
                        dto.setIsCompleted(!acceptedSubmissions.isEmpty());
                    } else {
                        dto.setIsCompleted(false);
                    }
                } else {
                    dto.setIsCompleted(false);
                }
            } catch (Exception e) {
                // If any error occurs, set to false
                dto.setIsCompleted(false);
            }
        } else {
            // For non-coding questions, set to false (handled by separate logic)
            dto.setIsCompleted(false);
        }
        
        // System.out.println("got dto: " + dto.getTitle());
        
        return dto;
    }
    
    private QuestionDetailsDTO.TestcaseDTO convertTestcaseToDTO(Testcase testcase) {
        QuestionDetailsDTO.TestcaseDTO dto = new QuestionDetailsDTO.TestcaseDTO();
        dto.setId(testcase.getId());
        dto.setTest1(testcase.getTest1());
        dto.setOutput1(testcase.getOutput1());
        dto.setTest2(testcase.getTest2());
        dto.setOutput2(testcase.getOutput2());
        dto.setTest3(testcase.getTest3());
        dto.setOutput3(testcase.getOutput3());
        return dto;
    }
    
    private QuestionDetailsDTO.HintDTO convertHintToDTO(Hint hint) {
        QuestionDetailsDTO.HintDTO dto = new QuestionDetailsDTO.HintDTO();
        dto.setId(hint.getId());
        dto.setContent(hint.getContent());
        dto.setHintOrder(hint.getHintOrder());
        return dto;
    }
}