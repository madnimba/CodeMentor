package com.codementor.dto.completedquestion;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarkQuestionCompletedRequest {
    @NotNull(message = "Question ID is required")
    private Integer questionId;
} 