package com.codementor.service;

import com.codementor.domain.Company;
import com.codementor.dto.CompanyDTO;
import com.codementor.repository.CompanyRepository;
import com.codementor.repository.CompanyQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

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

    public CompanyDTO getCompanyById(Integer id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        return convertToDTO(company);
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
        
        // TODO: Implement solved questions count when user progress tracking is implemented
        dto.setSolvedQuestions(0);
        
        return dto;
    }
}