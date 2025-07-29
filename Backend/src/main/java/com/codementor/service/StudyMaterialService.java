package com.codementor.service;

import com.codementor.domain.Track;
import com.codementor.domain.Topic;
import com.codementor.domain.Subtopic;
import com.codementor.dto.study.TrackResponse;
import com.codementor.dto.study.TopicResponse;
import com.codementor.dto.study.SubtopicResponse;
import com.codementor.repository.TrackRepository;
import com.codementor.repository.TopicRepository;
import com.codementor.repository.SubtopicRepository;
import com.codementor.repository.UserArticleReadRepository;
import com.codementor.repository.ArticleRepository;
import com.codementor.domain.User;
import com.codementor.repository.UserRepository;
import com.codementor.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyMaterialService {
    private final TrackRepository trackRepository;
    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;
    private final UserArticleReadRepository userArticleReadRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TrackResponse> getAllTracks() {
        return trackRepository.findAll().stream()
            .map(this::mapToTrackResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsByTrackId(Integer trackId) {
        List<Topic> topics = topicRepository.findByTrackId(trackId);
        List<Subtopic> allSubtopics = subtopicRepository.findByTopicIdIn(
            topics.stream().map(Topic::getId).collect(Collectors.toList())
        );
        
        return topics.stream()
            .map(topic -> mapToTopicResponse(topic, allSubtopics))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubtopicResponse> getSubtopicsByTopicId(Integer topicId) {
        return subtopicRepository.findByTopicId(topicId).stream()
            .map(this::mapToSubtopicResponse)
            .collect(Collectors.toList());
    }

    private TrackResponse mapToTrackResponse(Track track) {
        TrackResponse response = new TrackResponse();
        response.setId(track.getId());
        response.setName(track.getName());
        // TODO: Calculate progress based on user's completed topics/subtopics
        response.setProgress(0);
        return response;
    }

    private TopicResponse mapToTopicResponse(Topic topic, List<Subtopic> allSubtopics) {
        TopicResponse response = new TopicResponse();
        response.setId(topic.getId());
        response.setName(topic.getName());
        response.setTrackId(topic.getTrack().getId());
        // TODO: Calculate progress based on user's completed subtopics
        response.setProgress(0);
        
        // Filter subtopics for this topic
        List<SubtopicResponse> topicSubtopics = allSubtopics.stream()
            .filter(subtopic -> subtopic.getTopic().getId().equals(topic.getId()))
            .map(this::mapToSubtopicResponse)
            .collect(Collectors.toList());
        response.setSubtopics(topicSubtopics);
        
        return response;
    }

    private SubtopicResponse mapToSubtopicResponse(Subtopic subtopic) {
        SubtopicResponse response = new SubtopicResponse();
        response.setId(subtopic.getId());
        response.setName(subtopic.getName());
        response.setTopicId(subtopic.getTopic().getId());
        
        // Get current user
        User currentUser = getCurrentUser();
        
        // Check if user has read any articles for this subtopic
        boolean isRead = false;
        if (currentUser != null) {
            List<com.codementor.domain.Article> articles = articleRepository.findBySubtopicId(subtopic.getId());
            if (!articles.isEmpty()) {
                // Check if user has read any of the articles for this subtopic
                isRead = articles.stream().anyMatch(article -> 
                    userArticleReadRepository.existsByUserIdAndArticleId(currentUser.getId(), article.getId())
                );
            }
        }
        
        response.setIsRead(isRead);
        response.setArticleSlug(subtopic.getName().toLowerCase().replace(" ", "-"));
        return response;
    }

    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                return userRepository.findByEmail(email).orElse(null);
            }
        } catch (Exception e) {
            // Return null if user is not authenticated
        }
        return null;
    }
} 