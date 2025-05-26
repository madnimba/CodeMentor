package com.codementor.dto.article;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private Long trackId;
    private String trackName;
    private Long topicId;
    private String topicName;
    private Long subtopicId;
    private String subtopicName;
    private Long createdById;
    private String createdByUsername;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private Set<Long> jobRoleIds;
    private Set<Long> questionIds;
} 