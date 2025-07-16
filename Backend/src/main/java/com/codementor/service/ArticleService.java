package com.codementor.service;

import com.codementor.domain.*;
import com.codementor.dto.article.ArticleResponse;
import com.codementor.dto.article.CreateArticleRequest;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final TrackRepository trackRepository;
    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;
    private final JobRoleRepository jobRoleRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final UserArticleReadRepository userArticleReadRepository;

    @Transactional
    public ArticleResponse createArticle(CreateArticleRequest request) {
        User currentUser = getCurrentUser();
        
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        
        Subtopic subtopic = null;
        if (request.getSubtopicId() != null) {
            subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
        }

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setSlug(generateSlug(request.getTitle()));
        article.setContent(request.getContent());
        article.setTrack(track);
        article.setTopic(topic);
        article.setSubtopic(subtopic);
        article.setCreatedBy(currentUser);
        article.setIsApproved(false);

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
        return mapToArticleResponse(savedArticle);
    }

    public ArticleResponse getArticleById(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        User currentUser = getCurrentUser();
        return mapToArticleResponse(article, currentUser);
    }

    @Transactional
    public ArticleResponse markArticleAsRead(Integer articleId) {
        User currentUser = getCurrentUser();
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        
        // Check if already read
        Optional<UserArticleRead> existingRead = userArticleReadRepository.findByUserIdAndArticleId(
            currentUser.getId(), articleId);
        
        if (existingRead.isEmpty()) {
            UserArticleRead userArticleRead = new UserArticleRead();
            userArticleRead.setUser(currentUser);
            userArticleRead.setArticle(article);
            userArticleReadRepository.save(userArticleRead);
        }
        
        return mapToArticleResponse(article);
    }

    public Page<ArticleResponse> getArticlesByFilters(Integer trackId, Integer topicId, Integer subtopicId, 
    Integer jobRoleId, Pageable pageable) {
        Page<Article> articles;
        User currentUser = getCurrentUser();
        
        // if (trackId != null) {
        //     articles = articleRepository.findByTrackId(trackId, pageable);
        // } else 
        if (topicId != null) {
            articles = articleRepository.findByTopicId(topicId, pageable);
        } else if (subtopicId != null) {
            articles = articleRepository.findBySubtopicId(subtopicId, pageable);
        } else if (jobRoleId != null) {
            articles = articleRepository.findByJobRoleId(jobRoleId, pageable);
        } else {
            articles = articleRepository.findAllApproved(pageable);
        }
        
        return articles.map(article -> mapToArticleResponse(article, currentUser));
    }

    @Transactional
    public ArticleResponse updateArticle(Integer id, CreateArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        
        User currentUser = getCurrentUser();
        if (!article.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this article");
        }

        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        
        Subtopic subtopic = null;
        if (request.getSubtopicId() != null) {
            subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
        }

        article.setTitle(request.getTitle());
        article.setSlug(generateSlug(request.getTitle()));
        article.setContent(request.getContent());
        article.setTrack(track);
        article.setTopic(topic);
        article.setSubtopic(subtopic);

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

        Article updatedArticle = articleRepository.save(article);
        return mapToArticleResponse(updatedArticle);
    }

    @Transactional
    public void deleteArticle(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        
        User currentUser = getCurrentUser();
        if (!article.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this article");
        }

        articleRepository.delete(article);
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

    private ArticleResponse mapToArticleResponse(Article article) {
        return mapToArticleResponse(article, null);
    }

    private ArticleResponse mapToArticleResponse(Article article, User currentUser) {
        ArticleResponse response = new ArticleResponse();
        response.setId(article.getId());
        response.setTitle(article.getTitle());
        response.setSlug(article.getSlug());
        response.setContent(article.getContent());
        response.setTrackId(article.getTrack().getId());
        response.setTrackName(article.getTrack().getName());
        response.setTopicId(article.getTopic().getId());
        response.setTopicName(article.getTopic().getName());
        if (article.getSubtopic() != null) {
            response.setSubtopicId(article.getSubtopic().getId());
            response.setSubtopicName(article.getSubtopic().getName());
        }
        response.setCreatedById(article.getCreatedBy().getId());
        response.setCreatedByUsername(article.getCreatedBy().getUsername());
        response.setIsApproved(article.getIsApproved());
        response.setCreatedAt(article.getCreatedAt());
        
        Set<Integer> jobRoleIds = new HashSet<>();
        article.getJobRoles().forEach(jobRole -> jobRoleIds.add(jobRole.getId()));
        response.setJobRoleIds(jobRoleIds);
        
        Set<Integer> questionIds = new HashSet<>();
        article.getQuestions().forEach(question -> questionIds.add(question.getId()));
        response.setQuestionIds(questionIds);
        
        // Check if article is read by current user
        if (currentUser != null) {
            Optional<UserArticleRead> userArticleRead = userArticleReadRepository.findByUserIdAndArticleId(
                currentUser.getId(), article.getId());
            if (userArticleRead.isPresent()) {
                response.setIsRead(true);
                response.setReadAt(userArticleRead.get().getReadAt());
            } else {
                response.setIsRead(false);
            }
        } else {
            response.setIsRead(false);
        }
        
        return response;
    }

    public List<ArticleResponse> getArticlesBySubtopicId(Integer subtopicId) {
        List<Article> articles = articleRepository.findBySubtopicId(subtopicId);
        User currentUser = getCurrentUser();
        return articles.stream().map(article -> mapToArticleResponse(article, currentUser)).collect(Collectors.toList());
    }
} 