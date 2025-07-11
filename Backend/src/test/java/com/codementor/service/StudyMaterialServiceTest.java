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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StudyMaterialServiceTest {
    @Mock
    private TrackRepository trackRepository;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private SubtopicRepository subtopicRepository;

    @InjectMocks
    private StudyMaterialService studyMaterialService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllTracks() {
        Track track1 = new Track();
        track1.setId(1);
        track1.setName("Track 1");
        Track track2 = new Track();
        track2.setId(2);
        track2.setName("Track 2");
        when(trackRepository.findAll()).thenReturn(Arrays.asList(track1, track2));
        List<TrackResponse> result = studyMaterialService.getAllTracks();
        assertEquals(2, result.size());
        assertEquals("Track 1", result.get(0).getName());
        assertEquals(0, result.get(0).getProgress());
    }

    @Test
    void testGetAllTracks_Empty() {
        when(trackRepository.findAll()).thenReturn(Collections.emptyList());
        List<TrackResponse> result = studyMaterialService.getAllTracks();
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetTopicsByTrackId() {
        Topic topic1 = new Topic();
        topic1.setId(1);
        topic1.setName("Topic 1");
        Track track = new Track();
        track.setId(10);
        topic1.setTrack(track);
        Topic topic2 = new Topic();
        topic2.setId(2);
        topic2.setName("Topic 2");
        topic2.setTrack(track);
        List<Topic> topics = Arrays.asList(topic1, topic2);
        when(topicRepository.findByTrackId(10)).thenReturn(topics);
        Subtopic sub1 = new Subtopic();
        sub1.setId(100);
        sub1.setName("Subtopic 1");
        sub1.setTopic(topic1);
        Subtopic sub2 = new Subtopic();
        sub2.setId(200);
        sub2.setName("Subtopic 2");
        sub2.setTopic(topic2);
        List<Subtopic> allSubs = Arrays.asList(sub1, sub2);
        when(subtopicRepository.findByTopicIdIn(Arrays.asList(1,2))).thenReturn(allSubs);
        List<TopicResponse> result = studyMaterialService.getTopicsByTrackId(10);
        assertEquals(2, result.size());
        assertEquals("Topic 1", result.get(0).getName());
        assertEquals(1, result.get(0).getSubtopics().size());
        assertEquals("Subtopic 1", result.get(0).getSubtopics().get(0).getName());
    }

    @Test
    void testGetTopicsByTrackId_Empty() {
        when(topicRepository.findByTrackId(10)).thenReturn(Collections.emptyList());
        when(subtopicRepository.findByTopicIdIn(Collections.emptyList())).thenReturn(Collections.emptyList());
        List<TopicResponse> result = studyMaterialService.getTopicsByTrackId(10);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetSubtopicsByTopicId() {
        Topic topic = new Topic();
        topic.setId(1);
        topic.setName("Topic 1");
        Subtopic sub1 = new Subtopic();
        sub1.setId(100);
        sub1.setName("Subtopic 1");
        sub1.setTopic(topic);
        when(subtopicRepository.findByTopicId(1)).thenReturn(Arrays.asList(sub1));
        List<SubtopicResponse> result = studyMaterialService.getSubtopicsByTopicId(1);
        assertEquals(1, result.size());
        assertEquals("Subtopic 1", result.get(0).getName());
        assertEquals(1, result.get(0).getTopicId());
        assertEquals("subtopic-1", result.get(0).getArticleSlug());
        assertFalse(result.get(0).getIsRead());
    }

    @Test
    void testGetSubtopicsByTopicId_Empty() {
        when(subtopicRepository.findByTopicId(1)).thenReturn(Collections.emptyList());
        List<SubtopicResponse> result = studyMaterialService.getSubtopicsByTopicId(1);
        assertTrue(result.isEmpty());
    }
} 