package com.codementor.dto.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class CreateArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Track ID is required")
    private Integer trackId;

    @NotNull(message = "Topic ID is required")
    private Integer topicId;

    private Integer subtopicId;
    private Set<Integer> jobRoleIds;
    private Set<Integer> questionIds;
} 