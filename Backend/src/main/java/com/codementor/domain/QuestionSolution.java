package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "solutions")
@EntityListeners(AuditingEntityListener.class)
public class QuestionSolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "question_id", foreignKey = @ForeignKey(name = "solutions_question_id_fkey"))
    private Question question;

    @ManyToOne
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "solutions_created_by_fkey"), nullable = true)
    private User createdBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(length = 50)
    private String language;

    @Column(length = 50)
    private String status;

    @Column
    private Double runtime;

    @Column
    private Double memory;

    @CreatedDate
    @Column(name = "submitted_at", nullable = true, updatable = false)
    private LocalDateTime submittedAt;
} 