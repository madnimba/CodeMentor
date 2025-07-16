package com.codementor.repository;

import com.codementor.domain.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TEMPLATE: Replace "Note" with your actual entity name
 * This repository handles database operations for the entity
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {
    
    // Basic find methods
    Optional<Note> findByNoteTitle(String name);
    
    // Find by user who created it
    List<Note> findByUserId(Integer userId);
    
    
    // Search by name containing text
    @Query("SELECT t FROM Note t WHERE t.noteTitle ILIKE %?1%")
    Page<Note> findByNoteTitleContainingIgnoreCase(String name, Pageable pageable);
    

} 