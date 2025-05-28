package com.codementor.dto.study;

import lombok.Data;
import java.util.List;

@Data
public class TopicResponse {
    private Integer id;
    private String name;
    private Integer trackId;
    private Integer progress;
    private List<SubtopicResponse> subtopics;
} 