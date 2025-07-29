package com.codementor.service;

import com.codementor.domain.Topic;
import com.codementor.domain.User;
import com.codementor.dto.dashboard.TopicProgressDTO;
import com.codementor.repository.ArticleRepository;
import com.codementor.repository.QuestionRepository;
import com.codementor.repository.TopicRepository;
import com.codementor.repository.UserRepository;
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

    /**
     * Get comprehensive topic progress for the current user
     * Includes both articles read and coding problems solved
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
                    
                    // Calculate article progress
                    Long totalArticles = articleRepository.countByTopicId(topic.getId());
                    Long articlesRead = articleRepository.countArticlesReadByUserAndTopic(user.getId(), topic.getId());
                    double articleProgress = totalArticles > 0 ? (double) articlesRead / totalArticles * 100 : 0;
                    
                    // Calculate coding problem progress
                    Long totalQuestions = questionRepository.countByTopicId(topic.getId());
                    Long questionsSolved = questionRepository.countSolvedQuestionsByUserAndTopic(user.getId(), topic.getId());
                    double questionProgress = totalQuestions > 0 ? (double) questionsSolved / totalQuestions * 100 : 0;
                    
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
                    dto.setQuestionsSolved(questionsSolved.intValue());
                    dto.setProgress(Math.round(overallProgress * 100.0) / 100.0);
                    
                    // Set legacy fields for backward compatibility
                    dto.setTotal(totalArticles.intValue() + totalQuestions.intValue());
                    dto.setSolved(articlesRead.intValue() + questionsSolved.intValue());
                    
                    logger.info("Topic: {}, Articles: {}/{}, Questions: {}/{}, Progress: {}%", 
                        topic.getName(), articlesRead, totalArticles, questionsSolved, totalQuestions, overallProgress);
                    
                    return dto;
                })
                .collect(Collectors.toList());

        logger.info("Final topic progress DTOs size: {}", result.size());
        return result;
    }
} 