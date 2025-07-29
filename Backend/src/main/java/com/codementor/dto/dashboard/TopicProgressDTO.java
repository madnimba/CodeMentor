package com.codementor.dto.dashboard;

import lombok.Data;

@Data
public class TopicProgressDTO {
    private String topicName;
    private Integer articlesRead;
    private Integer totalArticles;
    private Integer questionsSolved;
    private Integer totalQuestions;
    private Double progress;
    
    // Legacy fields for backward compatibility
    private Integer solved;
    private Integer total;
} 