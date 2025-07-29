package com.codementor.service;

import com.codementor.domain.*;
import com.codementor.dto.question.CreateQuestionRequest;
import com.codementor.dto.question.QuestionResponse;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final TrackRepository trackRepository;
    private final SubtopicRepository subtopicRepository;
    private final TestcaseRepository testcaseRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyQuestionRepository companyQuestionRepository;
    private final CompletedQuestionRepository completedQuestionRepository;
    private final SubmissionRepository submissionRepository;

    @Transactional
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        User currentUser = getCurrentUser();
        
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        
        Subtopic subtopic = null;
        if (request.getSubtopicId() != null) {
            subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
        }

        Question question = new Question();
        question.setTitle(request.getTitle());
        question.setSlug(generateSlug(request.getTitle()));
        question.setDescription(request.getDescription());
        question.setContentFingerprint(generateContentFingerprint(request.getDescription()));
        question.setDifficulty(Question.Difficulty.valueOf(request.getDifficulty()));
        question.setImportanceTag(request.getImportanceTag());
        question.setTrack(track);
        question.setSubtopic(subtopic);
        question.setCreatedBy(currentUser);
        question.setUpvotes(0);
        question.setDownvotes(0);
        question.setIsApproved(false);
        question.setIsCoding(request.getIsCoding() != null ? request.getIsCoding() : false);
        question.setQuestion_year(request.getQuestion_year() != null ? request.getQuestion_year() : (short) 2024);

        Question savedQuestion = questionRepository.save(question);

        // Create company-question association if companyId is provided
        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            
            CompanyQuestion companyQuestion = new CompanyQuestion();
            companyQuestion.setCompany(company);
            companyQuestion.setQuestion(savedQuestion);
            companyQuestionRepository.save(companyQuestion);
        }

        // Create testcases if provided
        if (request.getTestcases() != null && !request.getTestcases().isEmpty()) {
            for (CreateQuestionRequest.TestcaseRequest testcaseRequest : request.getTestcases()) {
                Testcase testcase = new Testcase();
                testcase.setQuestion(savedQuestion);
                testcase.setTest1(testcaseRequest.getTest1());
                testcase.setOutput1(testcaseRequest.getOutput1());
                testcase.setTest2(testcaseRequest.getTest2());
                testcase.setOutput2(testcaseRequest.getOutput2());
                testcase.setTest3(testcaseRequest.getTest3());
                testcase.setOutput3(testcaseRequest.getOutput3());
                testcaseRepository.save(testcase);
            }
        }

        return mapToQuestionResponse(savedQuestion);
    }

    public org.springframework.data.domain.Page<QuestionResponse> getCodingQuestions(Pageable pageable) {
        return questionRepository.findByIsCodingTrue(pageable)
                .map(this::mapToQuestionResponse);
    }

    // Search questions
    public org.springframework.data.domain.Page<QuestionResponse> searchQuestions(String searchTerm, Boolean isCoding, Pageable pageable) {
        org.springframework.data.domain.Page<Question> questions = questionRepository.searchQuestions(searchTerm, true, isCoding, pageable); // Only approved questions
        return questions.map(this::mapToQuestionResponse);
    }

    // Comprehensive filtering method
    public org.springframework.data.domain.Page<QuestionResponse> getQuestionsWithFilters(
            String searchTerm,
            Integer trackId,
            Integer topicId,
            Integer subtopicId,
            String difficulty,
            Short year,
            Integer companyId,
            Boolean isCoding,
            Boolean isApproved,
            Pageable pageable) {
        
        Question.Difficulty difficultyEnum = null;
        if (difficulty != null && !difficulty.isEmpty()) {
            try {
                difficultyEnum = Question.Difficulty.valueOf(difficulty);
            } catch (IllegalArgumentException e) {
                // Invalid difficulty, ignore
            }
        }
        
        org.springframework.data.domain.Page<Question> questions = questionRepository.findQuestionsWithFilters(
            searchTerm,
            trackId,
            topicId,
            subtopicId,
            difficultyEnum,
            year,
            companyId,
            isApproved != null ? isApproved : true, // Default to approved questions for public endpoints
            isCoding,
            pageable
        );
        
        return questions.map(this::mapToQuestionResponse);
    }

    // Admin-specific filtering method
    public org.springframework.data.domain.Page<QuestionResponse> getQuestionsWithFiltersAdmin(
            String searchTerm,
            Integer trackId,
            Integer topicId,
            Integer subtopicId,
            String difficulty,
            Short year,
            Integer companyId,
            Boolean isCoding,
            Boolean isApproved,
            Pageable pageable) {
        
        Question.Difficulty difficultyEnum = null;
        if (difficulty != null && !difficulty.isEmpty()) {
            try {
                difficultyEnum = Question.Difficulty.valueOf(difficulty);
            } catch (IllegalArgumentException e) {
                // Invalid difficulty, ignore
            }
        }
        
        org.springframework.data.domain.Page<Question> questions = questionRepository.findQuestionsWithFiltersAdmin(
            searchTerm,
            trackId,
            topicId,
            subtopicId,
            difficultyEnum,
            year,
            companyId,
            isApproved,
            isCoding,
            pageable
        );
        
        return questions.map(this::mapToQuestionResponse);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }

    private String generateContentFingerprint(String description) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(description.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not available", e);
        }
    }

    private QuestionResponse mapToQuestionResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setTitle(question.getTitle());
        response.setSlug(question.getSlug());
        response.setDescription(question.getDescription());
        response.setDifficulty(question.getDifficulty() != null ? question.getDifficulty().name() : null);
        response.setImportanceTag(question.getImportanceTag() != null ? question.getImportanceTag() : null);
        
        // Add null checks for Track
        if (question.getTrack() != null) {
            response.setTrackId(question.getTrack().getId());
            response.setTrackName(question.getTrack().getName());
        }
        
        if (question.getSubtopic() != null) {
            response.setSubtopicId(question.getSubtopic().getId());
            response.setSubtopicName(question.getSubtopic().getName());
        }
        
        // Add null checks for CreatedBy
        if (question.getCreatedBy() != null) {
            response.setCreatedById(question.getCreatedBy().getId());
            response.setCreatedByUsername(question.getCreatedBy().getUsername());
        }
        
        response.setUpvotes(question.getUpvotes());
        response.setDownvotes(question.getDownvotes());
        response.setIsApproved(question.getIsApproved());
        response.setIsCoding(question.getIsCoding());
        response.setCreatedAt(question.getCreatedAt() != null ? question.getCreatedAt() : null);
        response.setQuestion_year(question.getQuestion_year());

        // Get companies associated with this question
        List<CompanyQuestion> companyQuestions = companyQuestionRepository.findByQuestionId(question.getId());
        if (!companyQuestions.isEmpty()) {
            // Use the first company name (you might want to show all companies in the future)
            response.setCompanyName(companyQuestions.get(0).getCompany().getName());
        }

        // Get testcases for this question
        List<Testcase> testcases = testcaseRepository.findByQuestionId(question.getId());
        List<QuestionResponse.TestcaseResponse> testcaseResponses = testcases.stream()
                .map(this::mapToTestcaseResponse)
                .collect(Collectors.toList());
        response.setTestcases(testcaseResponses);

        // Check completion status
        try {
            User currentUser = getCurrentUser();
            if (question.getIsCoding()) {
                // For coding questions, check if user has an accepted submission
                List<Submission> acceptedSubmissions = submissionRepository.findByUserIdAndQuestionIdAndStatusOrderBySubmittedAtDesc(
                    currentUser.getId(), question.getId(), "accepted");
                response.setIsCompleted(!acceptedSubmissions.isEmpty());
            } else {
                // For non-coding questions, check completed questions table
                boolean isCompleted = completedQuestionRepository.existsByUserIdAndQuestionId(
                    currentUser.getId(), question.getId());
                response.setIsCompleted(isCompleted);
            }
        } catch (Exception e) {
            // If user is not authenticated or other error, set to false
            response.setIsCompleted(false);
        }

        return response;
    }

    private QuestionResponse.TestcaseResponse mapToTestcaseResponse(Testcase testcase) {
        QuestionResponse.TestcaseResponse response = new QuestionResponse.TestcaseResponse();
        response.setId(testcase.getId());
        response.setTest1(testcase.getTest1());
        response.setOutput1(testcase.getOutput1());
        response.setTest2(testcase.getTest2());
        response.setOutput2(testcase.getOutput2());
        response.setTest3(testcase.getTest3());
        response.setOutput3(testcase.getOutput3());
        return response;
    }
} 