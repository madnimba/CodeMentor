package com.codementor.dto.study;

import lombok.Data;

@Data
public class SubtopicResponse {
    private Integer id;
    private String name;
    private Integer topicId;
    private Boolean isRead;
    private String articleSlug;
} 