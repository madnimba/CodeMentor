package com.codementor.service;

import com.codementor.domain.*;
import com.codementor.dto.article.ArticleResponse;
import com.codementor.dto.article.CreateArticleRequest;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private SubtopicRepository subtopicRepository;

    @Mock
    private JobRoleRepository jobRoleRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ArticleService articleService;

    private User testUser;
    private Track testTrack;
    private Topic testTopic;
    private Subtopic testSubtopic;
    private JobRole testJobRole;
    private Question testQuestion;
    private Article testArticle;
    private CreateArticleRequest createRequest;

    private static final Integer TEST_USER_ID = 1;
    private static final Integer TEST_TRACK_ID = 1;
    private static final Integer TEST_TOPIC_ID = 1;
    private static final Integer TEST_SUBTOPIC_ID = 1;
    private static final Integer TEST_JOB_ROLE_ID = 1;
    private static final Integer TEST_QUESTION_ID = 1;
    private static final Integer TEST_ARTICLE_ID = 1;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_TITLE = "Test Article";
    private static final String TEST_CONTENT = "Test content";

    @BeforeEach
    void setUp() {
        // Setup test data
        testUser = new User();
        testUser.setId(TEST_USER_ID);
        testUser.setEmail(TEST_EMAIL);

        testTrack = new Track();
        testTrack.setId(TEST_TRACK_ID);
        testTrack.setName("Test Track");

        testTopic = new Topic();
        testTopic.setId(TEST_TOPIC_ID);
        testTopic.setName("Test Topic");

        testSubtopic = new Subtopic();
        testSubtopic.setId(TEST_SUBTOPIC_ID);
        testSubtopic.setName("Test Subtopic");

        testJobRole = new JobRole();
        testJobRole.setId(TEST_JOB_ROLE_ID);
        testJobRole.setName("Test Job Role");

        testQuestion = new Question();
        testQuestion.setId(TEST_QUESTION_ID);
        testQuestion.setTitle("Test Question");

        testArticle = new Article();
        testArticle.setId(TEST_ARTICLE_ID);
        testArticle.setTitle(TEST_TITLE);
        testArticle.setContent(TEST_CONTENT);
        testArticle.setSlug("test-article");
        testArticle.setTrack(testTrack);
        testArticle.setTopic(testTopic);
        testArticle.setSubtopic(testSubtopic);
        testArticle.setCreatedBy(testUser);
        testArticle.setIsApproved(false);
        testArticle.setCreatedAt(LocalDateTime.now());

        createRequest = new CreateArticleRequest();
        createRequest.setTitle(TEST_TITLE);
        createRequest.setContent(TEST_CONTENT);
        createRequest.setTrackId(TEST_TRACK_ID);
        createRequest.setTopicId(TEST_TOPIC_ID);
        createRequest.setSubtopicId(TEST_SUBTOPIC_ID);
        createRequest.setJobRoleIds(new HashSet<>(Arrays.asList(TEST_JOB_ROLE_ID)));
        createRequest.setQuestionIds(new HashSet<>(Arrays.asList(TEST_QUESTION_ID)));
    }

    private void setupSecurityContext() {
        // Setup security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getName()).thenReturn(TEST_EMAIL);
    }

    @Test
    void createArticle_Success() {
        // Arrange
        setupSecurityContext();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(trackRepository.findById(TEST_TRACK_ID)).thenReturn(Optional.of(testTrack));
        when(topicRepository.findById(TEST_TOPIC_ID)).thenReturn(Optional.of(testTopic));
        when(subtopicRepository.findById(TEST_SUBTOPIC_ID)).thenReturn(Optional.of(testSubtopic));
        when(jobRoleRepository.findById(TEST_JOB_ROLE_ID)).thenReturn(Optional.of(testJobRole));
        when(questionRepository.findById(TEST_QUESTION_ID)).thenReturn(Optional.of(testQuestion));
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        // Act
        ArticleResponse result = articleService.createArticle(createRequest);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_ARTICLE_ID, result.getId());
        assertEquals(TEST_TITLE, result.getTitle());
        assertEquals("test-article", result.getSlug());
        verify(articleRepository).save(any(Article.class));
    }

    @Test
    void createArticle_TrackNotFound_ThrowsException() {
        // Arrange
        setupSecurityContext();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(trackRepository.findById(TEST_TRACK_ID)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> articleService.createArticle(createRequest));
        
        assertEquals("Track not found", exception.getMessage());
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void getArticleById_Success() {
        // Arrange
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.of(testArticle));

        // Act
        ArticleResponse result = articleService.getArticleById(TEST_ARTICLE_ID);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_ARTICLE_ID, result.getId());
        assertEquals(TEST_TITLE, result.getTitle());
        verify(articleRepository).findById(TEST_ARTICLE_ID);
    }

    @Test
    void getArticleById_NotFound_ThrowsException() {
        // Arrange
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> articleService.getArticleById(TEST_ARTICLE_ID));
        
        assertEquals("Article not found", exception.getMessage());
    }

    @Test
    void getArticlesByFilters_ByTopicId_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Article> articlePage = new PageImpl<>(Arrays.asList(testArticle));
        when(articleRepository.findByTopicId(TEST_TOPIC_ID, pageable)).thenReturn(articlePage);

        // Act
        Page<ArticleResponse> result = articleService.getArticlesByFilters(null, TEST_TOPIC_ID, null, null, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(articleRepository).findByTopicId(TEST_TOPIC_ID, pageable);
    }

    @Test
    void getArticlesByFilters_AllApproved_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Article> articlePage = new PageImpl<>(Arrays.asList(testArticle));
        when(articleRepository.findAllApproved(pageable)).thenReturn(articlePage);

        // Act
        Page<ArticleResponse> result = articleService.getArticlesByFilters(null, null, null, null, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(articleRepository).findAllApproved(pageable);
    }

    @Test
    void updateArticle_Success() {
        // Arrange
        setupSecurityContext();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.of(testArticle));
        when(trackRepository.findById(TEST_TRACK_ID)).thenReturn(Optional.of(testTrack));
        when(topicRepository.findById(TEST_TOPIC_ID)).thenReturn(Optional.of(testTopic));
        when(subtopicRepository.findById(TEST_SUBTOPIC_ID)).thenReturn(Optional.of(testSubtopic));
        when(jobRoleRepository.findById(TEST_JOB_ROLE_ID)).thenReturn(Optional.of(testJobRole));
        when(questionRepository.findById(TEST_QUESTION_ID)).thenReturn(Optional.of(testQuestion));
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        // Act
        ArticleResponse result = articleService.updateArticle(TEST_ARTICLE_ID, createRequest);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_ARTICLE_ID, result.getId());
        verify(articleRepository).save(any(Article.class));
    }

    @Test
    void updateArticle_Unauthorized_ThrowsException() {
        // Arrange
        setupSecurityContext();
        User differentUser = new User();
        differentUser.setId(999);
        differentUser.setEmail("different@example.com");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(differentUser));
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.of(testArticle));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class,
                () -> articleService.updateArticle(TEST_ARTICLE_ID, createRequest));
        
        assertEquals("You are not authorized to update this article", exception.getMessage());
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void deleteArticle_Success() {
        // Arrange
        setupSecurityContext();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.of(testArticle));
        doNothing().when(articleRepository).delete(testArticle);

        // Act
        articleService.deleteArticle(TEST_ARTICLE_ID);

        // Assert
        verify(articleRepository).delete(testArticle);
    }

    @Test
    void deleteArticle_Unauthorized_ThrowsException() {
        // Arrange
        setupSecurityContext();
        User differentUser = new User();
        differentUser.setId(999);
        differentUser.setEmail("different@example.com");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(differentUser));
        when(articleRepository.findById(TEST_ARTICLE_ID)).thenReturn(Optional.of(testArticle));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class,
                () -> articleService.deleteArticle(TEST_ARTICLE_ID));
        
        assertEquals("You are not authorized to delete this article", exception.getMessage());
        verify(articleRepository, never()).delete(any(Article.class));
    }
} 