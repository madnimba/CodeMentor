package com.codementor.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionDetailsDTO {
    private String title;
    private String description;
    private String difficulty;
    private String importanceTag;
    private TrackDTO track;
    private Integer upvotes;
    private Integer downvotes;
    private List<TestcaseDTO> testcases;
    private List<HintDTO> hints;

    @Data
    public static class TrackDTO {
        private Integer id;
        private String name;
    }

    @Data
    public static class TestcaseDTO {
        private Integer id;
        private String test1;
        private String output1;
        private String test2;
        private String output2;
        private String test3;
        private String output3;
    }

    @Data
    public static class HintDTO {
        private Integer id;
        private String content;
        private Integer hintOrder;
    }
} 