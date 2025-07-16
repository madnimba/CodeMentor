package com.codementor.service;

import com.codementor.domain.TemplateEntity;
import com.codementor.domain.User;
import com.codementor.dto.template.CreateTemplateEntityRequest;
import com.codementor.dto.template.TemplateEntityResponse;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.TemplateEntityRepository;
import com.codementor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This service contains all business logic for the entity
 */
@Service
@RequiredArgsConstructor
public class TemplateEntityService {
    
    private final TemplateEntityRepository templateEntityRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new template entity
     */
    @Transactional
    public TemplateEntityResponse createTemplateEntity(CreateTemplateEntityRequest request) {
        User currentUser = getCurrentUser();
        
        TemplateEntity templateEntity = new TemplateEntity();
        templateEntity.setName(request.getName());
        templateEntity.setDescription(request.getDescription());
        templateEntity.setStatus(TemplateEntity.TemplateStatus.valueOf(request.getStatus().name()));
        templateEntity.setIsActive(request.getIsActive());
        templateEntity.setCreatedBy(currentUser);
        
        TemplateEntity savedEntity = templateEntityRepository.save(templateEntity);
        return mapToTemplateEntityResponse(savedEntity);
    }
    
    /**
     * Get template entity by ID
     */
    public TemplateEntityResponse getTemplateEntityById(Integer id) {
        TemplateEntity templateEntity = templateEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        return mapToTemplateEntityResponse(templateEntity);
    }
    
    /**
     * Get all template entities with pagination and filtering
     */
    public Page<TemplateEntityResponse> getTemplateEntities(Pageable pageable) {
        Page<TemplateEntity> entities = templateEntityRepository.findAllActivePublished(pageable);
        return entities.map(this::mapToTemplateEntityResponse);
    }
    
    /**
     * Search template entities by name
     */
    public Page<TemplateEntityResponse> searchTemplateEntities(String name, Pageable pageable) {
        Page<TemplateEntity> entities = templateEntityRepository.findByNameContainingIgnoreCase(name, pageable);
        return entities.map(this::mapToTemplateEntityResponse);
    }
    
    /**
     * Get template entities by status
     */
    public List<TemplateEntityResponse> getTemplateEntitiesByStatus(TemplateEntity.TemplateStatus status) {
        List<TemplateEntity> entities = templateEntityRepository.findByStatus(status);
        return entities.stream()
                .map(this::mapToTemplateEntityResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update template entity
     */
    @Transactional
    public TemplateEntityResponse updateTemplateEntity(Integer id, CreateTemplateEntityRequest request) {
        TemplateEntity templateEntity = templateEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        
        User currentUser = getCurrentUser();
        if (!templateEntity.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this template entity");
        }
        
        templateEntity.setName(request.getName());
        templateEntity.setDescription(request.getDescription());
        templateEntity.setStatus(TemplateEntity.TemplateStatus.valueOf(request.getStatus().name()));
        templateEntity.setIsActive(request.getIsActive());
        
        TemplateEntity updatedEntity = templateEntityRepository.save(templateEntity);
        return mapToTemplateEntityResponse(updatedEntity);
    }
    
    /**
     * Delete template entity
     */
    @Transactional
    public void deleteTemplateEntity(Integer id) {
        TemplateEntity templateEntity = templateEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        
        User currentUser = getCurrentUser();
        if (!templateEntity.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this template entity");
        }
        
        templateEntityRepository.delete(templateEntity);
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    /**
     * Map entity to response DTO
     */
    private TemplateEntityResponse mapToTemplateEntityResponse(TemplateEntity entity) {
        TemplateEntityResponse response = new TemplateEntityResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus().name());
        response.setIsActive(entity.getIsActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getCreatedBy() != null) {
            response.setCreatedById(entity.getCreatedBy().getId());
            response.setCreatedByUsername(entity.getCreatedBy().getUsername());
        }
        
        // Example computed field
        response.setDisplayName(entity.getName() + " (" + entity.getStatus() + ")");
        
        return response;
    }
} 