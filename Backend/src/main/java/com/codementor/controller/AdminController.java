package com.codementor.controller;

import com.codementor.dto.common.ApiResponse;
import com.codementor.dto.admin.AdminDashboardStats;
import com.codementor.dto.admin.AdminUserResponse;
import com.codementor.dto.admin.AdminArticleResponse;
import com.codementor.dto.admin.AdminQuestionResponse;
import com.codementor.dto.admin.AdminCompanyResponse;
import com.codementor.dto.admin.UpdateUserRequest;
import com.codementor.dto.admin.UpdateArticleRequest;
import com.codementor.dto.admin.UpdateQuestionRequest;
import com.codementor.dto.admin.UpdateCompanyRequest;
import com.codementor.dto.admin.CreateCompanyRequest;
import com.codementor.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;

    // Dashboard Stats
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(pageable)));
    }

    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> searchUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean isAdmin,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.searchUsers(searchTerm, isAdmin, pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, request)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    // Article Management
    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<Page<AdminArticleResponse>>> getAllArticles(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllArticles(pageable)));
    }

    @GetMapping("/articles/search")
    public ResponseEntity<ApiResponse<Page<AdminArticleResponse>>> searchArticles(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean isApproved,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.searchArticles(searchTerm, isApproved, pageable)));
    }

    @GetMapping("/articles/unapproved")
    public ResponseEntity<ApiResponse<Page<AdminArticleResponse>>> getUnapprovedArticles(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUnapprovedArticles(pageable)));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<AdminArticleResponse>> getArticleById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getArticleById(id)));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<AdminArticleResponse>> updateArticle(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateArticle(id, request)));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Integer id) {
        adminService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    @PostMapping("/articles/{id}/approve")
    public ResponseEntity<ApiResponse<AdminArticleResponse>> approveArticle(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.approveArticle(id)));
    }

    // Question Management
    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<Page<AdminQuestionResponse>>> getAllQuestions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllQuestions(pageable)));
    }

    @GetMapping("/questions/search")
    public ResponseEntity<ApiResponse<Page<AdminQuestionResponse>>> searchQuestions(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean isApproved,
            @RequestParam(required = false) Boolean isCoding,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.searchQuestions(searchTerm, isApproved, isCoding, pageable)));
    }

    @GetMapping("/questions/unapproved")
    public ResponseEntity<ApiResponse<Page<AdminQuestionResponse>>> getUnapprovedQuestions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUnapprovedQuestions(pageable)));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> getQuestionById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getQuestionById(id)));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> updateQuestion(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateQuestion(id, request)));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Integer id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    @PostMapping("/questions/{id}/approve")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> approveQuestion(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.approveQuestion(id)));
    }

    // Company Management
    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<Page<AdminCompanyResponse>>> getAllCompanies(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCompanies(pageable)));
    }

    @GetMapping("/companies/search")
    public ResponseEntity<ApiResponse<Page<AdminCompanyResponse>>> searchCompanies(
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.searchCompanies(searchTerm, pageable)));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<AdminCompanyResponse>> getCompanyById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCompanyById(id)));
    }

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<AdminCompanyResponse>> createCompany(
            @Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createCompany(request)));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<AdminCompanyResponse>> updateCompany(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateCompany(id, request)));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Integer id) {
        adminService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Company deleted successfully", null));
    }

    // Bulk Operations
    @PostMapping("/articles/approve-all")
    public ResponseEntity<ApiResponse<String>> approveAllArticles() {
        int count = adminService.approveAllArticles();
        return ResponseEntity.ok(ApiResponse.success("All articles approved successfully", count + " articles approved"));
    }

    @PostMapping("/questions/approve-all")
    public ResponseEntity<ApiResponse<String>> approveAllQuestions() {
        int count = adminService.approveAllQuestions();
        return ResponseEntity.ok(ApiResponse.success("All questions approved successfully", count + " questions approved"));
    }
} 