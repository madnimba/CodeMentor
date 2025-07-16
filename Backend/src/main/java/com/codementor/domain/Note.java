package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * TEMPLATE: Replace "Note" with your actual entity name
 * This is a JPA entity that represents a database table
 */
@Data
@Entity
@Table(name = "notes") // Replace with your table name
@EntityListeners(AuditingEntityListener.class)
public class Note {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "note_title", nullable = false)
    private String noteTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Example of a relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 