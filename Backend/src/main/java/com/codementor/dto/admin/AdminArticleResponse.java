package com.codementor.dto.admin;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class AdminArticleResponse {
    private Integer id;
    private String title;
    private String slug;
    private String content;
    private String track;
    private String topic;
    private String subtopic;
    private String createdBy;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private Set<String> jobRoles;
    private Integer questionCount;
} 