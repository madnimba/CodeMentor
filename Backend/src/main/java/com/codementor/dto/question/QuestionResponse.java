package com.codementor.dto.question;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuestionResponse {
    private Integer id;
    private String title;
    private String slug;
    private String description;
    private String contentFingerprint;
    private String difficulty;
    private String importanceTag;
    private TrackDTO track;
    private SubtopicDTO subtopic;
    private UserDTO createdBy;
    private Integer upvotes;
    private Integer downvotes;
    private LocalDateTime createdAt;

    @Data
    public static class TrackDTO {
        private Integer id;
        private String name;
    }

    @Data
    public static class SubtopicDTO {
        private Integer id;
        private String name;
        private TopicDTO topic;
    }

    @Data
    public static class TopicDTO {
        private Integer id;
        private String name;
    }

    @Data
    public static class UserDTO {
        private Integer id;
        private String name;
        private String email;
    }
} 