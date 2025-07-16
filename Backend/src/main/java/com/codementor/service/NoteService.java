package com.codementor.service;

import com.codementor.domain.Note;
import com.codementor.domain.User;
import com.codementor.dto.note.CreateNoteRequest;
import com.codementor.dto.note.NoteResponse;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.NoteRepository;
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
 * TEMPLATE: Replace "Note" with your actual entity name
 * This service contains all business logic for the entity
 */
@Service
@RequiredArgsConstructor
public class NoteService {
    
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new template entity
     */
    @Transactional
    public NoteResponse createNote(CreateNoteRequest request) {
        User currentUser = getCurrentUser();
        
        Note note = new Note();
        note.setNoteTitle(request.getNoteTitle());
        note.setDescription(request.getDescription());
        note.setUser(currentUser);
        
        Note savedEntity = noteRepository.save(note);
        return mapToNoteResponse(savedEntity);
    }
    
    /**
     * Get template entity by ID
     */
    public NoteResponse getNoteById(Integer id) {
        Note Note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        return mapToNoteResponse(Note);
    }
    
    /**
     * Get all template entities with pagination and filtering
     */
    public Page<NoteResponse> getNotes(Pageable pageable) {
        Page<Note> entities = noteRepository.findAll(pageable);
        return entities.map(this::mapToNoteResponse);
    }
    
    /**
     * Search template entities by name
     */
    public Page<NoteResponse> searchNotes(String name, Pageable pageable) {
        Page<Note> entities = noteRepository.findByNoteTitleContainingIgnoreCase(name, pageable);
        return entities.map(this::mapToNoteResponse);
    }
    

    
    /**
     * Update template entity
     */
    @Transactional
    public NoteResponse updateNote(Integer id, CreateNoteRequest request) {
        Note Note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        
        User currentUser = getCurrentUser();
        if (!Note.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this template entity");
        }
        
            Note.setNoteTitle(request.getNoteTitle());
        Note.setDescription(request.getDescription());
        
        Note updatedEntity = noteRepository.save(Note);
        return mapToNoteResponse(updatedEntity);
    }
    
    /**
     * Delete template entity
     */
    @Transactional
    public void deleteNote(Integer id) {
        Note Note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template entity not found"));
        
        User currentUser = getCurrentUser();
        if (!Note.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this template entity");
        }
        
        noteRepository.delete(Note);
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
    private NoteResponse mapToNoteResponse(Note entity) {
        NoteResponse response = new NoteResponse();
        response.setId(entity.getId());
        response.setNoteTitle(entity.getNoteTitle());
        response.setDescription(entity.getDescription());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getUser() != null) {
            response.setCreatedById(entity.getUser().getId());
            response.setCreatedByUsername(entity.getUser().getUsername());
        }
        
        // Example computed field
        response.setDisplayName(entity.getNoteTitle());
        
        return response;
    }
} 