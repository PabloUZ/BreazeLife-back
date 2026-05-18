package com.highdev.breazelife.modules.affiliate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highdev.breazelife.modules.quote.dto.response.PagedResponseDTO;
import com.highdev.breazelife.modules.quote.dto.response.QuoteResponseDTO;
import com.highdev.breazelife.modules.affiliate.dto.request.AffiliateRequestDTO;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// Módulo User (Donde vive la clase padre o asociada)
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateProfileResponseDTO;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateDashboardResponseDTO;
import com.highdev.breazelife.modules.profitability.entity.ProfitabilityHistory;
import com.highdev.breazelife.modules.profitability.repository.ProfitabilityHistoryRepository;

@Service
public class AffiliateService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private AffiliateRepository affiliateRepository;

    @Autowired
    private ProfitabilityHistoryRepository profitabilityHistoryRepository;

    public AffiliateProfileResponseDTO getProfile(String affiliateId) {
        Affiliate affiliate = affiliateRepository.findById(affiliateId)
                .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND",
                        "Pension account not found for this affiliate"));
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND",
                        "Pension account not found for this affiliate"));
        return AffiliateProfileResponseDTO.from(affiliate, account);
    }

    public AffiliateDashboardResponseDTO getDashboard(String affiliateId) {
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND",
                        "Pension account not found for this affiliate"));

        int rawDays = account.getQuotedDays() != null ? account.getQuotedDays() : 0;
        BigDecimal quotedWeeks = BigDecimal.valueOf(rawDays)
                .divide(BigDecimal.valueOf(7), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal weeksRemaining = BigDecimal.valueOf(1300).subtract(quotedWeeks);
        BigDecimal progressPercentage = quotedWeeks
                .divide(BigDecimal.valueOf(1300), 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        AffiliateDashboardResponseDTO.LastContribution lastContribution = quoteRepository
                .findTopByAccountAffiliateUserIdAndStatusOrderByContribDateDesc(
                        affiliateId, Quote.QuoteStatus.ACCEPTED)
                .map(q -> {
                    BigDecimal employer = q.getEmployerContrib() != null ? q.getEmployerContrib() : BigDecimal.ZERO;
                    BigDecimal affiliate = q.getAffiliateContrib() != null ? q.getAffiliateContrib() : BigDecimal.ZERO;
                    return new AffiliateDashboardResponseDTO.LastContribution(
                            q.getId(),
                            q.getEmployerContrib(),
                            q.getAffiliateContrib(),
                            employer.add(affiliate),
                            q.getDaysContributed(),
                            q.getContribDate(),
                            q.getStatus().name()
                    );
                })
                .orElse(null);

        AffiliateDashboardResponseDTO.MonthlyProfitability monthlyProfitability =
                profitabilityHistoryRepository.findTopByAccountIdOrderByDateDesc(account.getId())
                        .map(p -> new AffiliateDashboardResponseDTO.MonthlyProfitability(
                                p.getProfit(), p.getDate()))
                        .orElse(null);

        return new AffiliateDashboardResponseDTO(
                account.getId(),
                account.getAccountType() != null ? account.getAccountType().name() : null,
                account.getBalance(),
                quotedWeeks,
                weeksRemaining,
                progressPercentage,
                monthlyProfitability,
                lastContribution
        );
    }

    public PagedResponseDTO<QuoteResponseDTO> getQuoteHistory(String affiliateId, Quote.QuoteStatus status, LocalDate from, LocalDate to, int page, int size) {
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new AffiliateNotFoundException(affiliateId));

        if (from != null && to != null && from.isAfter(to)) throw new InvalidDateRangeException();

        LocalDateTime fromDT = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDT = to != null ? to.atTime(23, 59, 59) : null;

        Page<Quote> quotesPage = quoteRepository.findByFilters(account.getId(), status, fromDT, toDT, PageRequest.of(page, size));

        List<QuoteResponseDTO> content = quotesPage.getContent().stream()
                .map(this::mapToQuoteResponseDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(quotesPage.getTotalElements(), quotesPage.getTotalPages(), quotesPage.getNumber(), content);
    }

   @Transactional
    public void saveAffiliate(AffiliateRequestDTO dto) {
        if (affiliateRepository.existsByDocument(dto.document())) {
            throw new AffiliateAlreadyExistsException(dto.document());
        }

        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "No existe un usuario con el ID: " + dto.userId()));

        Affiliate affiliate = new Affiliate();
        affiliate.setUser(user);
        affiliate.setDocument(dto.document());
        affiliate.setBirthDate(dto.birthDate());
        affiliate.setPhoneNumber(dto.phoneNumber());
        affiliate.setAffiliationDate(LocalDate.now());
        affiliate.setStatus(Affiliate.Status.ACTIVE);

        affiliateRepository.save(affiliate);
    }

    private QuoteResponseDTO mapToQuoteResponseDTO(Quote quote) {
        QuoteResponseDTO dto = new QuoteResponseDTO();
        dto.setQuoteId(quote.getId());
        dto.setEmployerContrib(quote.getEmployerContrib());
        dto.setAffiliateContrib(quote.getAffiliateContrib());
        if (quote.getEmployerContrib() != null && quote.getAffiliateContrib() != null) {
            dto.setTotalContrib(quote.getEmployerContrib().add(quote.getAffiliateContrib()));
        }
        dto.setDaysContributed(quote.getDaysContributed());
        dto.setContribDate(quote.getContribDate());
        dto.setStatus(quote.getStatus() != null ? quote.getStatus().name() : null);
        dto.setReviewedBy(quote.getReviewedBy() != null ? quote.getReviewedBy().getUserId() : null);
        dto.setReviewedAt(quote.getReviewedAt());
        dto.setComment(quote.getComment());

        if (quote.getPayment() != null) {
            QuoteResponseDTO.PaymentDTO paymentDTO = new QuoteResponseDTO.PaymentDTO();
            paymentDTO.setPaymentId(quote.getPayment().getId());
            dto.setPayment(paymentDTO);
        }
        return dto;
    }
}
