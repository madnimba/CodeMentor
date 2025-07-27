package com.codementor.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

@Data
public class UpdateArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Track ID is required")
    private Integer trackId;
    
    @NotNull(message = "Topic ID is required")
    private Integer topicId;
    
    private Integer subtopicId;
    private Boolean isApproved;
    private Set<Integer> jobRoleIds;
    private Set<Integer> questionIds;
} 