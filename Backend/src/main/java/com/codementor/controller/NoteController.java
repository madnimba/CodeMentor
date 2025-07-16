package com.codementor.controller;

import com.codementor.domain.Note;
import com.codementor.dto.note.CreateNoteRequest;
import com.codementor.dto.note.NoteResponse;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.NoteService;
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
@RequestMapping("/notes") // Notes endpoint path
@RequiredArgsConstructor
public class NoteController {
    
    private final NoteService noteService;
    
    /**
     * Create a new note
     * POST /notes
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody CreateNoteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.createNote(request)
        ));
    }
    
    /**
     * Get note by ID
     * GET /notes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.getNoteById(id)
        ));
    }
    
    /**
     * Get all notes with pagination
     * GET /notes?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getNotes(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.getNotes(pageable)
        ));
    }
    
    /**
     * Search notes by title
     * GET /notes/search?name=searchTerm&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> searchNotes(
            @RequestParam String name, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.searchNotes(name, pageable)
        ));
    }
    
    /**
     * Get notes by status
     * GET /notes/status/{status}
     */
        // @GetMapping("/status/{status}")
        // public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByStatus(
        //         @PathVariable String status) {
        //     return ResponseEntity.ok(ApiResponse.success(
        //         noteService.getNotesByStatus(status)
        //     ));
        // }
    
    /**
     * Update note
     * PUT /notes/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Integer id,
            @Valid @RequestBody CreateNoteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.updateNote(id, request)
        ));
    }
    
    /**
     * Delete note
     * DELETE /notes/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Integer id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
    }
} 