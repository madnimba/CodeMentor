package com.codementor.dto;

import lombok.Data;

@Data
public class QuestionDetailsDTO {
    private String title;
    private String description;
    private String difficulty;
    private String importanceTag;
    private TrackDTO track;
    private Integer upvotes;
    private Integer downvotes;

    @Data
    public static class TrackDTO {
        private Integer id;
        private String name;
    }
} 