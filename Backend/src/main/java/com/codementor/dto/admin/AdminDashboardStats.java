package com.codementor.dto.admin;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class AdminDashboardStats {
    private Long totalUsers;
    private Long totalCompanies;
    private Long totalQuestions;
    private Long totalArticles;
    private Long unapprovedArticles;
    private Long unapprovedQuestions;
    private Long activeUsersToday;
    private Long newUsersThisWeek;
} 