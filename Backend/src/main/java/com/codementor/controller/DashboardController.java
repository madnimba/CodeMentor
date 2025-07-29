package com.codementor.controller;

import com.codementor.dto.dashboard.TopicProgressDTO;
import com.codementor.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Get topic progress for the current user
     * GET /dashboard/topic-progress
     */
    @GetMapping("/topic-progress")
    public ResponseEntity<List<TopicProgressDTO>> getTopicProgress() {
        List<TopicProgressDTO> topicProgress = dashboardService.getTopicProgress();
        return ResponseEntity.ok(topicProgress);
    }
} 