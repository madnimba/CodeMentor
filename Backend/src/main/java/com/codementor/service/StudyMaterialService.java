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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyMaterialService {
    private final TrackRepository trackRepository;
    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;

    public List<TrackResponse> getAllTracks() {
        return trackRepository.findAll().stream()
            .map(this::mapToTrackResponse)
            .collect(Collectors.toList());
    }

    public List<TopicResponse> getTopicsByTrackId(Integer trackId) {
        return topicRepository.findByTrackId(trackId).stream()
            .map(this::mapToTopicResponse)
            .collect(Collectors.toList());
    }

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

    private TopicResponse mapToTopicResponse(Topic topic) {
        TopicResponse response = new TopicResponse();
        response.setId(topic.getId());
        response.setName(topic.getName());
        response.setTrackId(topic.getTrack().getId());
        // TODO: Calculate progress based on user's completed subtopics
        response.setProgress(0);
        response.setSubtopics(getSubtopicsByTopicId(topic.getId()));
        return response;
    }

    private SubtopicResponse mapToSubtopicResponse(Subtopic subtopic) {
        SubtopicResponse response = new SubtopicResponse();
        response.setId(subtopic.getId());
        response.setName(subtopic.getName());
        response.setTopicId(subtopic.getTopic().getId());
        // TODO: Set isRead based on user's progress
        response.setIsRead(false);
        // TODO: Set articleSlug based on related article
        response.setArticleSlug(subtopic.getName().toLowerCase().replace(" ", "-"));
        return response;
    }
} 