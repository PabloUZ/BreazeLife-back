package com.highdev.breazelife.modules.admin.service;

import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardSummaryResponseDTO;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminDashboardService {

    @Autowired
    private AffiliateRepository affiliateRepository;

    @Autowired
    private EmployerRepository employerRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private AccountRepository accountRepository;

    public AdminDashboardSummaryResponseDTO getSummary() {
        LocalDate now = LocalDate.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);

        return new AdminDashboardSummaryResponseDTO(
                affiliateRepository.countByStatus(Affiliate.Status.ACTIVE),
                employerRepository.countByStatus(Employer.Status.ACTIVE),
                quoteRepository.countByStatus(Quote.QuoteStatus.PENDING),
                defaultZero(accountRepository.sumAllBalances()),
                defaultZero(quoteRepository.sumContributionsByStatusAndContribDateBetween(
                        Quote.QuoteStatus.ACCEPTED,
                        startOfMonth,
                        startOfNextMonth
                ))
        );
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
