package com.highdev.breazelife.modules.admin.service;

import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.admin.dto.response.AdminAlertItemDTO;
import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardAlertsResponseDTO;
import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardGraphsResponseDTO;
import com.highdev.breazelife.modules.admin.dto.response.AffiliateFundTypeGraphDTO;
import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardSummaryResponseDTO;
import com.highdev.breazelife.modules.admin.dto.response.FundDistributionGraphDTO;
import com.highdev.breazelife.modules.admin.dto.response.MonthlyContributionGraphDTO;
import com.highdev.breazelife.modules.admin.dto.response.QuoteStatusGraphDTO;
import com.highdev.breazelife.modules.admin.exceptions.AdminDashboardAlertsException;
import com.highdev.breazelife.modules.admin.exceptions.AdminDashboardGraphsException;
import com.highdev.breazelife.modules.admin.exceptions.AdminDashboardSummaryException;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.repository.FundRepository;
import com.highdev.breazelife.modules.notification.service.NotificationService;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
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

    @Autowired
    private FundRepository fundRepository;

    @Autowired
    private NotificationService notificationService;

    public AdminDashboardSummaryResponseDTO getSummary() {
        try {
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
        } catch (Exception ex) {
            throw new AdminDashboardSummaryException(ex);
        }
    }

    public AdminDashboardGraphsResponseDTO getGraphs() {
        try {
            return new AdminDashboardGraphsResponseDTO(
                    buildQuotesByStatus(),
                    buildMonthlyContributions(),
                    buildAffiliatesByFundType(),
                    buildFundDistribution()
            );
        } catch (Exception ex) {
            throw new AdminDashboardGraphsException(ex);
        }
    }

    public AdminDashboardAlertsResponseDTO getAlerts(String adminUserId) {
        try {
            List<AdminAlertItemDTO> alerts = new ArrayList<>();

            long pendingQuotes = quoteRepository.countByStatus(Quote.QuoteStatus.PENDING);
            addAlertIfAny(
                    alerts,
                    "PENDING_QUOTES",
                    "WARNING",
                    pendingQuotes,
                    "There are %d pension quotes pending review."
            );

            long unreadNotifications = notificationService.countUnreadNotifications(adminUserId);
            addAlertIfAny(
                    alerts,
                    "UNREAD_NOTIFICATIONS",
                    "INFO",
                    unreadNotifications,
                    "You have %d unread notifications."
            );

            long suspendedAccounts = affiliateRepository.countByStatus(Affiliate.Status.SUSPENDED)
                    + employerRepository.countByStatus(Employer.Status.SUSPENDED);
            addAlertIfAny(
                    alerts,
                    "SUSPENDED_ACCOUNTS",
                    "WARNING",
                    suspendedAccounts,
                    "There are %d suspended accounts."
            );

            return new AdminDashboardAlertsResponseDTO(alerts);
        } catch (Exception ex) {
            throw new AdminDashboardAlertsException(ex);
        }
    }

    private List<QuoteStatusGraphDTO> buildQuotesByStatus() {
        EnumMap<Quote.QuoteStatus, Long> countsByStatus = new EnumMap<>(Quote.QuoteStatus.class);

        for (Quote.QuoteStatus status : Quote.QuoteStatus.values()) {
            countsByStatus.put(status, 0L);
        }

        for (QuoteRepository.QuoteStatusCountProjection projection : quoteRepository.countQuotesGroupedByStatus()) {
            countsByStatus.put(projection.getStatus(), defaultZero(projection.getCount()));
        }

        List<QuoteStatusGraphDTO> graphs = new ArrayList<>();
        for (Quote.QuoteStatus status : Quote.QuoteStatus.values()) {
            graphs.add(new QuoteStatusGraphDTO(status.name(), countsByStatus.get(status)));
        }
        return graphs;
    }

    private List<MonthlyContributionGraphDTO> buildMonthlyContributions() {
        // Accepted quotes are the ones already treated as processed contributions in the current module logic.
        return quoteRepository.sumMonthlyContributionsByStatus(Quote.QuoteStatus.ACCEPTED)
                .stream()
                .map(projection -> new MonthlyContributionGraphDTO(
                        projection.getMonth(),
                        defaultZero(projection.getTotalContribution())
                ))
                .toList();
    }

    private List<AffiliateFundTypeGraphDTO> buildAffiliatesByFundType() {
        EnumMap<Account.AccountType, Long> countsByType = new EnumMap<>(Account.AccountType.class);

        for (Account.AccountType accountType : Account.AccountType.values()) {
            countsByType.put(accountType, 0L);
        }

        for (AccountRepository.AccountTypeCountProjection projection : accountRepository.countAccountsGroupedByType()) {
            countsByType.put(projection.getAccountType(), defaultZero(projection.getCount()));
        }

        List<AffiliateFundTypeGraphDTO> graphs = new ArrayList<>();
        for (Account.AccountType accountType : Account.AccountType.values()) {
            graphs.add(new AffiliateFundTypeGraphDTO(accountType.name(), countsByType.get(accountType)));
        }
        return graphs;
    }

    private List<FundDistributionGraphDTO> buildFundDistribution() {
        EnumMap<FundType, BigDecimal> balancesByType = new EnumMap<>(FundType.class);

        for (FundType fundType : FundType.values()) {
            balancesByType.put(fundType, BigDecimal.ZERO);
        }

        for (FundRepository.FundTypeBalanceProjection projection : fundRepository.sumBalancesGroupedByType()) {
            balancesByType.put(projection.getFundType(), defaultZero(projection.getTotalBalance()));
        }

        List<FundDistributionGraphDTO> graphs = new ArrayList<>();
        for (FundType fundType : FundType.values()) {
            graphs.add(new FundDistributionGraphDTO(fundType.name(), balancesByType.get(fundType)));
        }
        return graphs;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private Long defaultZero(Long value) {
        return value != null ? value : 0L;
    }

    private void addAlertIfAny(
            List<AdminAlertItemDTO> alerts,
            String type,
            String severity,
            long count,
            String messageTemplate
    ) {
        if (count > 0) {
            alerts.add(new AdminAlertItemDTO(type, severity, messageTemplate.formatted(count), count));
        }
    }
}
