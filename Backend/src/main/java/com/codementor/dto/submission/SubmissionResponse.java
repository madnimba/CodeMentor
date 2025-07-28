package com.codementor.dto.submission;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubmissionResponse {
    private Integer id;
    private Integer userId;
    private String username;
    private Integer questionId;
    private String questionTitle;
    private String code;
    private String language;
    private String status;
    private Double runtime;
    private Double memory;
    private LocalDateTime submittedAt;

} 