package com.codementor.controller;

import com.codementor.dto.CompanyDTO;
import com.codementor.dto.CompanyQuestionDTO;
import com.codementor.service.CompanyService;
import com.codementor.service.CompanyQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*")
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private CompanyQuestionService companyQuestionService;

    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<CompanyDTO>> getAllCompaniesPaginated(Pageable pageable) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Integer id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/{companyId}/questions")
    public ResponseEntity<List<CompanyQuestionDTO>> getCompanyQuestions(@PathVariable Integer companyId) {
        return ResponseEntity.ok(companyQuestionService.getCompanyQuestions(companyId));
    }

    @GetMapping("/{companyId}/questions/paginated")
    public ResponseEntity<Page<CompanyQuestionDTO>> getCompanyQuestionsPaginated(
            @PathVariable Integer companyId,
            Pageable pageable) {
        return ResponseEntity.ok(companyQuestionService.getCompanyQuestions(companyId, pageable));
    }

    @GetMapping("/{companyId}/questions/{questionId}")
    public ResponseEntity<CompanyQuestionDTO> getCompanyQuestion(
            @PathVariable Integer companyId,
            @PathVariable Integer questionId) {
        return ResponseEntity.ok(companyQuestionService.getCompanyQuestion(companyId, questionId));
    }
}