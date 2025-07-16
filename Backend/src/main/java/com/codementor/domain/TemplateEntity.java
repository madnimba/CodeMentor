package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * TEMPLATE: Replace "TemplateEntity" with your actual entity name
 * This is a JPA entity that represents a database table
 */
@Data
@Entity
@Table(name = "template_entities") // Replace with your table name
@EntityListeners(AuditingEntityListener.class)
public class TemplateEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Example of a relationship with User
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Example of a boolean field
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Example of an enum field
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TemplateStatus status = TemplateStatus.DRAFT;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Example enum
    public enum TemplateStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
} 