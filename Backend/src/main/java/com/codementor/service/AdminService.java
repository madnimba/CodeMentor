package com.codementor.service;

import com.codementor.domain.*;
import com.codementor.dto.admin.*;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final QuestionRepository questionRepository;
    private final ArticleRepository articleRepository;
    private final CompanyQuestionRepository companyQuestionRepository;
    private final TrackRepository trackRepository;
    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;
    private final JobRoleRepository jobRoleRepository;
    private final TestcaseRepository testcaseRepository;
    private final QuestionSolutionRepository questionSolutionRepository;

    // Dashboard Stats
    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCompanies = companyRepository.count();
        long totalQuestions = questionRepository.count();
        long totalArticles = articleRepository.count();
        long unapprovedArticles = articleRepository.countByIsApprovedFalse();
        long unapprovedQuestions = questionRepository.countByIsApprovedFalse();
        
        // For now, we'll use simple counts. In a real application, you might want to track these metrics
        long activeUsersToday = userRepository.count(); // Placeholder
        long newUsersThisWeek = userRepository.count(); // Placeholder
        
        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalCompanies(totalCompanies)
                .totalQuestions(totalQuestions)
                .totalArticles(totalArticles)
                .unapprovedArticles(unapprovedArticles)
                .unapprovedQuestions(unapprovedQuestions)
                .activeUsersToday(activeUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .build();
    }

    // User Management
    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToAdminUserResponse);
    }

    public AdminUserResponse getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToAdminUserResponse(user);
    }

    public AdminUserResponse updateUser(Integer id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setThemePreference(request.getThemePreference());
        user.setLanguagePreference(request.getLanguagePreference());
        user.setIsAdmin(request.getIsAdmin());
        
        if (request.getJobRoleId() != null) {
            JobRole jobRole = jobRoleRepository.findById(request.getJobRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job role not found"));
            user.setJobRole(jobRole);
        }
        
        User savedUser = userRepository.save(user);
        return mapToAdminUserResponse(savedUser);
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    // Search users
    public Page<AdminUserResponse> searchUsers(String searchTerm, Boolean isAdmin, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(searchTerm, isAdmin, pageable);
        return users.map(this::mapToAdminUserResponse);
    }

    // Article Management
    public Page<AdminArticleResponse> getAllArticles(Pageable pageable) {
        return articleRepository.findAll(pageable).map(this::mapToAdminArticleResponse);
    }

    public Page<AdminArticleResponse> getUnapprovedArticles(Pageable pageable) {
        return articleRepository.findByIsApprovedFalse(pageable).map(this::mapToAdminArticleResponse);
    }

    // Search articles
    public Page<AdminArticleResponse> searchArticles(String searchTerm, Boolean isApproved, Pageable pageable) {
        Page<Article> articles = articleRepository.searchArticles(searchTerm, isApproved, pageable);
        return articles.map(this::mapToAdminArticleResponse);
    }

    public AdminArticleResponse getArticleById(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        return mapToAdminArticleResponse(article);
    }

    public AdminArticleResponse updateArticle(Integer id, UpdateArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setIsApproved(request.getIsApproved());
        
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        article.setTrack(track);
        
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        article.setTopic(topic);
        
        if (request.getSubtopicId() != null) {
            Subtopic subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
            article.setSubtopic(subtopic);
        }
        
        if (request.getJobRoleIds() != null) {
            Set<JobRole> jobRoles = new HashSet<>();
            for (Integer jobRoleId : request.getJobRoleIds()) {
                JobRole jobRole = jobRoleRepository.findById(jobRoleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Job role not found"));
                jobRoles.add(jobRole);
            }
            article.setJobRoles(jobRoles);
        }
        
        if (request.getQuestionIds() != null) {
            Set<Question> questions = new HashSet<>();
            for (Integer questionId : request.getQuestionIds()) {
                Question question = questionRepository.findById(questionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
                questions.add(question);
            }
            article.setQuestions(questions);
        }
        
        Article savedArticle = articleRepository.save(article);
        return mapToAdminArticleResponse(savedArticle);
    }

    public void deleteArticle(Integer id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article not found");
        }
        articleRepository.deleteById(id);
    }

    public AdminArticleResponse approveArticle(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        article.setIsApproved(true);
        Article savedArticle = articleRepository.save(article);
        return mapToAdminArticleResponse(savedArticle);
    }

    // Question Management
    public Page<AdminQuestionResponse> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable).map(this::mapToAdminQuestionResponse);
    }

    public Page<AdminQuestionResponse> getUnapprovedQuestions(Pageable pageable) {
        return questionRepository.findByIsApprovedFalse(pageable).map(this::mapToAdminQuestionResponse);
    }

    public AdminQuestionResponse getQuestionById(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToAdminQuestionResponse(question);
    }

    public AdminQuestionResponse updateQuestion(Integer id, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());
        question.setDifficulty(Question.Difficulty.valueOf(request.getDifficulty()));
        question.setImportanceTag(request.getImportanceTag());
        question.setIsApproved(request.getIsApproved());
        if (request.getIsCoding() != null) {
            question.setIsCoding(request.getIsCoding());
        }
        if (request.getQuestion_year() != null) {
            question.setQuestion_year(request.getQuestion_year());
        }
        
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        question.setTrack(track);
        
        if (request.getSubtopicId() != null) {
            Subtopic subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
            question.setSubtopic(subtopic);
        }
        
        Question savedQuestion = questionRepository.save(question);
        return mapToAdminQuestionResponse(savedQuestion);
    }

    public void deleteQuestion(Integer id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    public AdminQuestionResponse approveQuestion(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        question.setIsApproved(true);
        Question savedQuestion = questionRepository.save(question);
        return mapToAdminQuestionResponse(savedQuestion);
    }

    // Search questions
    public Page<AdminQuestionResponse> searchQuestions(String searchTerm, Boolean isApproved, Boolean isCoding, Pageable pageable) {
        Page<Question> questions = questionRepository.searchQuestions(searchTerm, isApproved, isCoding, pageable);
        return questions.map(this::mapToAdminQuestionResponse);
    }

    // Comprehensive filtering for admin question searches
    public Page<AdminQuestionResponse> getQuestionsWithFilters(
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
        
        Page<Question> questions = questionRepository.findQuestionsWithFiltersAdmin(
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
        
        return questions.map(this::mapToAdminQuestionResponse);
    }

    // Company Management
    public Page<AdminCompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable).map(this::mapToAdminCompanyResponse);
    }

    // Search companies
    public Page<AdminCompanyResponse> searchCompanies(String searchTerm, Pageable pageable) {
        Page<Company> companies = companyRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        return companies.map(this::mapToAdminCompanyResponse);
    }

    public AdminCompanyResponse getCompanyById(Integer id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return mapToAdminCompanyResponse(company);
    }

    public AdminCompanyResponse createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        company.setLogoUrl(request.getLogoUrl());
        company.setCountry(request.getCountry());
        company.setDescription(request.getDescription());
        
        Company savedCompany = companyRepository.save(company);
        return mapToAdminCompanyResponse(savedCompany);
    }

    public AdminCompanyResponse updateCompany(Integer id, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        company.setName(request.getName());
        company.setLogoUrl(request.getLogoUrl());
        company.setCountry(request.getCountry());
        company.setDescription(request.getDescription());
        
        Company savedCompany = companyRepository.save(company);
        return mapToAdminCompanyResponse(savedCompany);
    }

    public void deleteCompany(Integer id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found");
        }
        companyRepository.deleteById(id);
    }

    // Bulk Operations
    @Transactional
    public int approveAllArticles() {
        // Get count before updating for return value
        long count = articleRepository.countByIsApprovedFalse();
        
        // Use bulk update query instead of loading all articles into memory
        int updatedCount = articleRepository.bulkApproveAllArticles();
        
        return updatedCount;
    }

    @Transactional
    public int approveAllQuestions() {
        // Get count before updating for return value
        long count = questionRepository.countByIsApprovedFalse();
        
        // Use bulk update query instead of loading all questions into memory
        int updatedCount = questionRepository.bulkApproveAllQuestions();
        
        return updatedCount;
    }

    // Mapping methods
    private AdminUserResponse mapToAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .createdAt(user.getCreatedAt())
                .jobRole(user.getJobRole() != null ? user.getJobRole().getName() : null)
                .themePreference(user.getThemePreference())
                .languagePreference(user.getLanguagePreference())
                .isAdmin(user.getIsAdmin())
                .build();
    }

    private AdminArticleResponse mapToAdminArticleResponse(Article article) {
        return AdminArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .content(article.getContent())
                .track(article.getTrack() != null ? article.getTrack().getName() : null)
                .topic(article.getTopic() != null ? article.getTopic().getName() : null)
                .subtopic(article.getSubtopic() != null ? article.getSubtopic().getName() : null)
                .createdBy(article.getCreatedBy() != null ? article.getCreatedBy().getUsername() : null)
                .isApproved(article.getIsApproved())
                .createdAt(article.getCreatedAt())
                .jobRoles(article.getJobRoles().stream()
                        .map(JobRole::getName)
                        .collect(Collectors.toSet()))
                .questionCount(article.getQuestions().size())
                .build();
    }

    private AdminQuestionResponse mapToAdminQuestionResponse(Question question) {
        // Get companies associated with this question
        List<String> companies = companyQuestionRepository.findByQuestionId(question.getId())
                .stream()
                .map(cq -> cq.getCompany().getName())
                .collect(Collectors.toList());
        
        return AdminQuestionResponse.builder()
                .id(question.getId())
                .title(question.getTitle())
                .description(question.getDescription())
                .difficulty(question.getDifficulty().name())
                .importanceTag(question.getImportanceTag())
                .track(question.getTrack() != null ? question.getTrack().getName() : null)
                .subtopic(question.getSubtopic() != null ? question.getSubtopic().getName() : null)
                .createdBy(question.getCreatedBy() != null ? question.getCreatedBy().getUsername() : null)
                .isApproved(question.getIsApproved())
                .isCoding(question.getIsCoding())
                .createdAt(question.getCreatedAt())
                .testcaseCount((int) testcaseRepository.countByQuestionId(question.getId()))
                .solutionCount((int) questionSolutionRepository.countByQuestionId(question.getId()))
                .companies(companies)
                .question_year(question.getQuestion_year())
                .build();
    }

    private AdminCompanyResponse mapToAdminCompanyResponse(Company company) {
        return AdminCompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .country(company.getCountry())
                .description(company.getDescription())
                .questionCount((int) companyQuestionRepository.countByCompanyId(company.getId()))
                .build();
    }
} 