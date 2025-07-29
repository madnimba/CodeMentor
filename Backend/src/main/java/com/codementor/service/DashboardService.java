package com.codementor.service;

import com.codementor.domain.Topic;
import com.codementor.domain.User;
import com.codementor.dto.dashboard.TopicProgressDTO;
import com.codementor.repository.ArticleRepository;
import com.codementor.repository.QuestionRepository;
import com.codementor.repository.TopicRepository;
import com.codementor.repository.UserRepository;
import com.codementor.repository.CompletedQuestionRepository;
import com.codementor.repository.SubmissionRepository;
import com.codementor.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompletedQuestionRepository completedQuestionRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    /**
     * Get comprehensive topic progress for the current user
     * Includes both articles read and questions solved (both coding and non-coding)
     */
    public List<TopicProgressDTO> getTopicProgress() {
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        logger.info("Getting comprehensive topic progress for user: {}", user.getId());

        // Get all topics
        List<Topic> allTopics = topicRepository.findAllOrderedByName();
        logger.info("Found {} topics in the system", allTopics.size());

        // Calculate progress for each topic
        List<TopicProgressDTO> result = allTopics.stream()
                .map(topic -> {
                    TopicProgressDTO dto = new TopicProgressDTO();
                    dto.setTopicName(topic.getName());
                    
                    // 1. Calculate article progress
                    // Total articles from articles table for this topic
                    Long totalArticles = articleRepository.countByTopicId(topic.getId());
                    // Read articles from userarticlereads table for this topic
                    Long articlesRead = articleRepository.countArticlesReadByUserAndTopic(user.getId(), topic.getId());
                    
                    // 2. Calculate question progress
                    // Total questions from questiontopics table for this topic
                    Long totalQuestions = questionRepository.countByTopicIdFromQuestionTopics(topic.getId());
                    
                    // Solved questions: coding questions from submissions + non-coding from completedquestions
                    Long codingQuestionsSolved = questionRepository.countSolvedCodingQuestionsByUserAndTopicFromQuestionTopics(user.getId(), topic.getId());
                    Long nonCodingQuestionsSolved = questionRepository.countSolvedNonCodingQuestionsByUserAndTopicFromQuestionTopics(user.getId(), topic.getId());
                    Long totalQuestionsSolved = codingQuestionsSolved + nonCodingQuestionsSolved;
                    
                    // Calculate progress percentages
                    double articleProgress = totalArticles > 0 ? (double) articlesRead / totalArticles * 100 : 0;
                    double questionProgress = totalQuestions > 0 ? (double) totalQuestionsSolved / totalQuestions * 100 : 0;
                    
                    // Calculate overall progress (average of article and question progress)
                    double overallProgress = 0;
                    if (totalArticles > 0 || totalQuestions > 0) {
                        if (totalArticles > 0 && totalQuestions > 0) {
                            // Both articles and questions exist, take average
                            overallProgress = (articleProgress + questionProgress) / 2;
                        } else if (totalArticles > 0) {
                            // Only articles exist
                            overallProgress = articleProgress;
                        } else {
                            // Only questions exist
                            overallProgress = questionProgress;
                        }
                    }
                    
                    // Set the values
                    dto.setTotalArticles(totalArticles.intValue());
                    dto.setArticlesRead(articlesRead.intValue());
                    dto.setTotalQuestions(totalQuestions.intValue());
                    dto.setQuestionsSolved(totalQuestionsSolved.intValue());
                    dto.setProgress(Math.round(overallProgress * 100.0) / 100.0);
                    
                    // Set legacy fields for backward compatibility
                    dto.setTotal(totalArticles.intValue() + totalQuestions.intValue());
                    dto.setSolved(articlesRead.intValue() + totalQuestionsSolved.intValue());
                    
                    logger.info("Topic: {}, Articles: {}/{}, Questions: {}/{}, Progress: {}%", 
                        topic.getName(), articlesRead, totalArticles, totalQuestionsSolved, totalQuestions, overallProgress);
                    
                    return dto;
                })
                .collect(Collectors.toList());

        logger.info("Final topic progress DTOs size: {}", result.size());
        return result;
    }
} 