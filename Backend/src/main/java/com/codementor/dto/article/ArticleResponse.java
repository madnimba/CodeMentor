package com.codementor.dto.article;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArticleResponse {
    private Integer id;
    private String title;
    private String slug;
    private String content;
    private Integer trackId;
    private String trackName;
    private Integer topicId;
    private String topicName;
    private Integer subtopicId;
    private String subtopicName;
    private Integer createdById;
    private String createdByUsername;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private Set<Integer> jobRoleIds;
    private Set<Integer> questionIds;
} 