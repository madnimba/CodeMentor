package com.codementor.controller;

import com.codementor.domain.TemplateEntity;
import com.codementor.dto.template.CreateTemplateEntityRequest;
import com.codementor.dto.template.TemplateEntityResponse;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.TemplateEntityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This controller handles HTTP requests for the entity
 */
@RestController
@RequestMapping("/template-entities") // Replace with your endpoint path
@RequiredArgsConstructor
public class TemplateEntityController {
    
    private final TemplateEntityService templateEntityService;
    
    /**
     * Create a new template entity
     * POST /template-entities
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TemplateEntityResponse>> createTemplateEntity(
            @Valid @RequestBody CreateTemplateEntityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.createTemplateEntity(request)
        ));
    }
    
    /**
     * Get template entity by ID
     * GET /template-entities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateEntityResponse>> getTemplateEntityById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.getTemplateEntityById(id)
        ));
    }
    
    /**
     * Get all template entities with pagination
     * GET /template-entities?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TemplateEntityResponse>>> getTemplateEntities(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.getTemplateEntities(pageable)
        ));
    }
    
    /**
     * Search template entities by name
     * GET /template-entities/search?name=searchTerm&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<TemplateEntityResponse>>> searchTemplateEntities(
            @RequestParam String name, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.searchTemplateEntities(name, pageable)
        ));
    }
    
    /**
     * Get template entities by status
     * GET /template-entities/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<TemplateEntityResponse>>> getTemplateEntitiesByStatus(
            @PathVariable String status) {
        TemplateEntity.TemplateStatus templateStatus = TemplateEntity.TemplateStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.getTemplateEntitiesByStatus(templateStatus)
        ));
    }
    
    /**
     * Update template entity
     * PUT /template-entities/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TemplateEntityResponse>> updateTemplateEntity(
            @PathVariable Integer id,
            @Valid @RequestBody CreateTemplateEntityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            templateEntityService.updateTemplateEntity(id, request)
        ));
    }
    
    /**
     * Delete template entity
     * DELETE /template-entities/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteTemplateEntity(@PathVariable Integer id) {
        templateEntityService.deleteTemplateEntity(id);
        return ResponseEntity.ok(ApiResponse.success("Template entity deleted successfully", null));
    }
} 