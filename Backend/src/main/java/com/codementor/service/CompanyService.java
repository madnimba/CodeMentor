package com.codementor.service;

import com.codementor.domain.Company;
import com.codementor.dto.CompanyDTO;
import com.codementor.dto.CompanyStatsDTO;
import com.codementor.repository.CompanyRepository;
import com.codementor.repository.CompanyQuestionRepository;
import com.codementor.repository.UserRepository;
import com.codementor.repository.SubmissionRepository;
import com.codementor.repository.CompletedQuestionRepository;
import com.codementor.domain.User;
import com.codementor.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@Transactional
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CompletedQuestionRepository completedQuestionRepository;

    public List<CompanyDTO> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        return companies.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Page<CompanyDTO> getAllCompanies(Pageable pageable) {
        Page<Company> companies = companyRepository.findAll(pageable);
        return companies.map(this::convertToDTO);
    }

    // Search companies
    public Page<CompanyDTO> searchCompanies(String searchTerm, Pageable pageable) {
        Page<Company> companies = companyRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        return companies.map(this::convertToDTO);
    }

    public CompanyDTO getCompanyById(Integer id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        return convertToDTO(company);
    }

    public List<CompanyStatsDTO> getFeaturedCompanies() {
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Get companies with most coding questions (limit to 4)
        List<Object[]> companiesData = companyQuestionRepository.findCompaniesWithMostCodingQuestions();
        
        return companiesData.stream()
                .limit(4)
                .map(data -> {
                    CompanyStatsDTO dto = new CompanyStatsDTO();
                    dto.setId((Integer) data[0]);
                    dto.setName((String) data[1]);
                    dto.setLogoUrl((String) data[2]);
                    dto.setCountry((String) data[3]);
                    dto.setDescription((String) data[4]);
                    dto.setTotalQuestions(((Number) data[5]).intValue());
                    
                    // Get solved questions by user for this company
                    Long solvedQuestions = companyQuestionRepository.countSolvedQuestionsByUserForCompany(dto.getId(), user.getId());
                    dto.setSolvedQuestions(solvedQuestions != null ? solvedQuestions.intValue() : 0);
                    
                    // Calculate progress percentage
                    if (dto.getTotalQuestions() > 0) {
                        double percentage = (double) dto.getSolvedQuestions() / dto.getTotalQuestions() * 100;
                        dto.setProgressPercentage(Math.round(percentage * 100.0) / 100.0);
                    } else {
                        dto.setProgressPercentage(0.0);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private CompanyDTO convertToDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setCountry(company.getCountry());
        dto.setDescription(company.getDescription());
        
        // Get total questions count
        int totalQuestions = (int) companyQuestionRepository.countByCompanyId(company.getId());

        dto.setTotalQuestions(totalQuestions);
        
        // Calculate solved questions for current user
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email).orElse(null);
                
                if (currentUser != null) {
                    // Get solved coding questions (accepted submissions)
                    Long solvedCodingQuestions = submissionRepository.countAcceptedSubmissionsByUserForCompany(
                        currentUser.getId(), company.getId());
                    
                    // Get solved non-coding questions (completed questions)
                    Long solvedNonCodingQuestions = completedQuestionRepository.countCompletedNonCodingQuestionsByUserForCompany(
                        currentUser.getId(), company.getId());
                    
                    int totalSolved = (solvedCodingQuestions != null ? solvedCodingQuestions.intValue() : 0) +
                                   (solvedNonCodingQuestions != null ? solvedNonCodingQuestions.intValue() : 0);
                    
                    dto.setSolvedQuestions(totalSolved);
                } else {
                    dto.setSolvedQuestions(0);
                }
            } else {
                dto.setSolvedQuestions(0);
            }
        } catch (Exception e) {
            // If any error occurs, set to 0
            dto.setSolvedQuestions(0);
        }
        
        return dto;
    }
}