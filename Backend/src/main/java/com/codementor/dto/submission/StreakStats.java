package com.codementor.dto.submission;

import lombok.Data;

@Data
public class StreakStats {
    private Integer currentStreak;
    private Integer longestStreak;
    
    public StreakStats(Integer currentStreak, Integer longestStreak) {
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
    }
} 