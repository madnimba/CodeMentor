package com.codementor.service;

import com.codementor.domain.Track;
import com.codementor.domain.Topic;
import com.codementor.domain.Subtopic;
import com.codementor.domain.Article;
import com.codementor.domain.User;
import com.codementor.dto.study.TrackResponse;
import com.codementor.dto.study.TopicResponse;
import com.codementor.dto.study.SubtopicResponse;
import com.codementor.repository.TrackRepository;
import com.codementor.repository.TopicRepository;
import com.codementor.repository.SubtopicRepository;
import com.codementor.repository.UserArticleReadRepository;
import com.codementor.repository.ArticleRepository;
import com.codementor.repository.UserRepository;
import com.codementor.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
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
        User currentUser = getCurrentUser();
        return trackRepository.findAll().stream()
            .map(track -> mapToTrackResponse(track, currentUser))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsByTrackId(Integer trackId) {
        User currentUser = getCurrentUser();
        List<Topic> topics = topicRepository.findByTrackId(trackId);
        List<Subtopic> allSubtopics = subtopicRepository.findByTopicIdIn(
            topics.stream().map(Topic::getId).collect(Collectors.toList())
        );
        
        return topics.stream()
            .map(topic -> mapToTopicResponse(topic, allSubtopics, currentUser))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubtopicResponse> getSubtopicsByTopicId(Integer topicId) {
        User currentUser = getCurrentUser();
        return subtopicRepository.findByTopicId(topicId).stream()
            .map(subtopic -> mapToSubtopicResponse(subtopic, currentUser))
            .collect(Collectors.toList());
    }

    private TrackResponse mapToTrackResponse(Track track, User currentUser) {
        TrackResponse response = new TrackResponse();
        response.setId(track.getId());
        response.setName(track.getName());
        
        // Calculate progress based on user's completed articles in this track
        List<Article> trackArticles = articleRepository.findByTrackId(track.getId());
        if (!trackArticles.isEmpty()) {
            List<Integer> readArticleIds = userArticleReadRepository.findArticleIdsByUserId(currentUser.getId());
            long readCount = trackArticles.stream()
                .mapToInt(Article::getId)
                .filter(readArticleIds::contains)
                .count();
            int progress = (int) ((readCount * 100) / trackArticles.size());
            response.setProgress(progress);
        } else {
            response.setProgress(0);
        }
        
        return response;
    }

    private TopicResponse mapToTopicResponse(Topic topic, List<Subtopic> allSubtopics, User currentUser) {
        TopicResponse response = new TopicResponse();
        response.setId(topic.getId());
        response.setName(topic.getName());
        response.setTrackId(topic.getTrack().getId());
        
        // Calculate progress based on user's completed subtopics in this topic
        List<Subtopic> topicSubtopics = allSubtopics.stream()
            .filter(subtopic -> subtopic.getTopic().getId().equals(topic.getId()))
            .collect(Collectors.toList());
        
        if (!topicSubtopics.isEmpty()) {
            List<Integer> readArticleIds = userArticleReadRepository.findArticleIdsByUserId(currentUser.getId());
            long readCount = topicSubtopics.stream()
                .mapToLong(subtopic -> {
                    List<Article> subtopicArticles = articleRepository.findBySubtopicId(subtopic.getId());
                    return subtopicArticles.stream()
                        .mapToInt(Article::getId)
                        .filter(readArticleIds::contains)
                        .count();
                })
                .sum();
            
            long totalArticles = topicSubtopics.stream()
                .mapToLong(subtopic -> articleRepository.findBySubtopicId(subtopic.getId()).size())
                .sum();
            
            int progress = totalArticles > 0 ? (int) ((readCount * 100) / totalArticles) : 0;
            response.setProgress(progress);
        } else {
            response.setProgress(0);
        }
        
        // Filter subtopics for this topic
        List<SubtopicResponse> topicSubtopicsResponse = topicSubtopics.stream()
            .map(subtopic -> mapToSubtopicResponse(subtopic, currentUser))
            .collect(Collectors.toList());
        response.setSubtopics(topicSubtopicsResponse);
        
        return response;
    }

    private SubtopicResponse mapToSubtopicResponse(Subtopic subtopic, User currentUser) {
        SubtopicResponse response = new SubtopicResponse();
        response.setId(subtopic.getId());
        response.setName(subtopic.getName());
        response.setTopicId(subtopic.getTopic().getId());
        
        // Check if all articles in this subtopic are read by the user
        List<Article> subtopicArticles = articleRepository.findBySubtopicId(subtopic.getId());
        if (!subtopicArticles.isEmpty()) {
            List<Integer> readArticleIds = userArticleReadRepository.findArticleIdsByUserId(currentUser.getId());
            boolean allRead = subtopicArticles.stream()
                .mapToInt(Article::getId)
                .allMatch(readArticleIds::contains);
            response.setIsRead(allRead);
        } else {
            response.setIsRead(false);
        }
        
        // Set articleSlug based on related article
        response.setArticleSlug(subtopic.getName().toLowerCase().replace(" ", "-"));
        return response;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
} 