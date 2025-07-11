package com.codementor.controller;

import com.codementor.dto.study.TrackResponse;
import com.codementor.dto.study.TopicResponse;
import com.codementor.dto.study.SubtopicResponse;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.StudyMaterialService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StudyMaterialControllerTest {

    @Mock
    private StudyMaterialService studyMaterialService;

    @InjectMocks
    private StudyMaterialController studyMaterialController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllTracks() {
        List<TrackResponse> tracks = Arrays.asList(new TrackResponse(), new TrackResponse());
        when(studyMaterialService.getAllTracks()).thenReturn(tracks);
        ResponseEntity<ApiResponse<List<TrackResponse>>> response = studyMaterialController.getAllTracks();
        assertEquals(ApiResponse.success(tracks), response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetTopicsByTrackId() {
        List<TopicResponse> topics = Arrays.asList(new TopicResponse());
        when(studyMaterialService.getTopicsByTrackId(1)).thenReturn(topics);
        ResponseEntity<ApiResponse<List<TopicResponse>>> response = studyMaterialController.getTopicsByTrackId(1);
        assertEquals(ApiResponse.success(topics), response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetSubtopicsByTopicId() {
        List<SubtopicResponse> subtopics = Arrays.asList(new SubtopicResponse());
        when(studyMaterialService.getSubtopicsByTopicId(2)).thenReturn(subtopics);
        ResponseEntity<ApiResponse<List<SubtopicResponse>>> response = studyMaterialController.getSubtopicsByTopicId(2);
        assertEquals(ApiResponse.success(subtopics), response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }
} 