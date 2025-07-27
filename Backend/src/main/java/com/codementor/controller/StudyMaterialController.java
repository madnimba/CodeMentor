package com.codementor.controller;

import com.codementor.dto.study.TrackResponse;
import com.codementor.dto.study.TopicResponse;
import com.codementor.dto.study.SubtopicResponse;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.StudyMaterialService;
import com.codementor.domain.JobRole;
import com.codementor.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
public class StudyMaterialController {
    private final StudyMaterialService studyMaterialService;
    private final JobRoleRepository jobRoleRepository;

    @GetMapping("/tracks")
    public ResponseEntity<ApiResponse<List<TrackResponse>>> getAllTracks() {
        return ResponseEntity.ok(ApiResponse.success(studyMaterialService.getAllTracks()));
    }

    @GetMapping("/tracks/{trackId}/topics")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopicsByTrackId(@PathVariable Integer trackId) {
        return ResponseEntity.ok(ApiResponse.success(studyMaterialService.getTopicsByTrackId(trackId)));
    }

    @GetMapping("/topics/{topicId}/subtopics")
    public ResponseEntity<ApiResponse<List<SubtopicResponse>>> getSubtopicsByTopicId(@PathVariable Integer topicId) {
        return ResponseEntity.ok(ApiResponse.success(studyMaterialService.getSubtopicsByTopicId(topicId)));
    }

    @GetMapping("/job-roles")
    public ResponseEntity<ApiResponse<List<JobRole>>> getAllJobRoles() {
        return ResponseEntity.ok(ApiResponse.success(jobRoleRepository.findAll()));
    }
} 