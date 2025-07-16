package com.codementor.repository;

import com.codementor.domain.TemplateEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This repository handles database operations for the entity
 */
@Repository
public interface TemplateEntityRepository extends JpaRepository<TemplateEntity, Integer> {
    
    // Basic find methods
    Optional<TemplateEntity> findByName(String name);
    
    // Find by status
    List<TemplateEntity> findByStatus(TemplateEntity.TemplateStatus status);
    
    // Find by user who created it
    List<TemplateEntity> findByCreatedById(Integer userId);
    
    // Find active entities
    List<TemplateEntity> findByIsActiveTrue();
    
    // Custom query with pagination
    @Query("SELECT t FROM TemplateEntity t WHERE t.isActive = true AND t.status = 'PUBLISHED'")
    Page<TemplateEntity> findAllActivePublished(Pageable pageable);
    
    // Search by name containing text
    @Query("SELECT t FROM TemplateEntity t WHERE t.name ILIKE %?1% AND t.isActive = true")
    Page<TemplateEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Count by status
    @Query("SELECT COUNT(t) FROM TemplateEntity t WHERE t.status = ?1")
    Long countByStatus(TemplateEntity.TemplateStatus status);
} 