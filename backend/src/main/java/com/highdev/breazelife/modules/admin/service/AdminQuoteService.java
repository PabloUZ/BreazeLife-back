package com.highdev.breazelife.modules.admin.service;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.account.service.AccumulationService;
import com.highdev.breazelife.modules.admin.dto.request.ReviewQuoteRequestDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminQuoteResponseDto;
import com.highdev.breazelife.modules.admin.entity.Admin;
import com.highdev.breazelife.modules.admin.exceptions.AdminQuoteActionException;
import com.highdev.breazelife.modules.admin.exceptions.AdminQuoteDetailException;
import com.highdev.breazelife.modules.admin.exceptions.AdminQuoteListException;
import com.highdev.breazelife.modules.admin.repository.AdminRepository;
import com.highdev.breazelife.modules.notification.events.ContributionApprovedEvent;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.PaginationMeta;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminQuoteService {

    public record AdminQuotesPage(List<AdminQuoteResponseDto> quotes, PaginationMeta pagination) {}

    private final QuoteRepository quoteRepository;
    private final AdminRepository adminRepository;
    private final AccumulationService accumulationService;
    private final ApplicationEventPublisher eventPublisher;

    public AdminQuoteService(
            QuoteRepository quoteRepository,
            AdminRepository adminRepository,
            AccumulationService accumulationService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.quoteRepository = quoteRepository;
        this.adminRepository = adminRepository;
        this.accumulationService = accumulationService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public AdminQuotesPage getQuotes(int page, int limit, Quote.QuoteStatus status) {
        try {
            validatePagination(page, limit);

            Quote.QuoteStatus effectiveStatus = status != null ? status : Quote.QuoteStatus.PENDING;
            Page<Quote> result = quoteRepository.findByStatusOrderByContribDateDesc(
                    effectiveStatus,
                    PageRequest.of(page - 1, limit)
            );

            List<AdminQuoteResponseDto> quotes = result.getContent().stream()
                    .map(this::mapToResponse)
                    .toList();

            return new AdminQuotesPage(quotes, new PaginationMeta(page, limit, result.getTotalElements()));
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminQuoteListException(ex);
        }
    }

    @Transactional(readOnly = true)
    public AdminQuoteResponseDto getQuoteById(String quoteId) {
        try {
            Quote quote = findQuote(quoteId);
            return mapToResponse(quote);
        } catch (NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminQuoteDetailException(ex);
        }
    }

    @Transactional
    public AdminQuoteResponseDto approveQuote(String quoteId, ReviewQuoteRequestDto request) {
        try {
            return reviewQuote(quoteId, Quote.QuoteStatus.ACCEPTED, request);
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminQuoteActionException("ADMIN_QUOTE_APPROVE_ERROR", "Failed to approve quote", ex);
        }
    }

    @Transactional
    public AdminQuoteResponseDto rejectQuote(String quoteId, ReviewQuoteRequestDto request) {
        try {
            return reviewQuote(quoteId, Quote.QuoteStatus.REJECTED, request);
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminQuoteActionException("ADMIN_QUOTE_REJECT_ERROR", "Failed to reject quote", ex);
        }
    }

    private AdminQuoteResponseDto reviewQuote(String quoteId, Quote.QuoteStatus targetStatus, ReviewQuoteRequestDto request) {
        Quote quote = findQuote(quoteId);
        validatePendingQuote(quote);

        Admin admin = getCurrentAdmin();
        if (targetStatus == Quote.QuoteStatus.ACCEPTED) {
            AccumulationService.AccumulationResult accumulationResult = accumulationService.processApprovedQuote(quote);
            eventPublisher.publishEvent(new ContributionApprovedEvent(
                    accumulationResult.affiliateId(),
                    accumulationResult.quoteId(),
                    accumulationResult.accountId(),
                    accumulationResult.accumulatedAmount(),
                    accumulationResult.newBalance()
            ));
        } else {
            quote.setStatus(targetStatus);
        }
        quote.setReviewedBy(admin);
        quote.setReviewedAt(LocalDateTime.now());
        quote.setComment(normalizeComment(request));

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    private Quote findQuote(String quoteId) {
        return quoteRepository.findById(quoteId)
                .orElseThrow(() -> new NotFoundException("QUOTE_NOT_FOUND", "Quote not found with id: " + quoteId));
    }

    private void validatePendingQuote(Quote quote) {
        if (quote.getStatus() != Quote.QuoteStatus.PENDING) {
            throw new BadRequestException(
                    "INVALID_QUOTE_STATUS",
                    "Only PENDING quotes can be approved or rejected"
            );
        }
    }

    private Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new BadRequestException("INVALID_ADMIN_CONTEXT", "Authenticated admin context is not available");
        }

        return adminRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException(
                        "ADMIN_NOT_FOUND",
                        "Admin profile not found for user id: " + currentUser.getId()
                ));
    }

    private AdminQuoteResponseDto mapToResponse(Quote quote) {
        BigDecimal employerContribution = defaultZero(quote.getEmployerContrib());
        BigDecimal affiliateContribution = defaultZero(quote.getAffiliateContrib());

        return new AdminQuoteResponseDto(
                quote.getId(),
                quote.getAccount() != null ? quote.getAccount().getId() : null,
                quote.getPayment() != null ? quote.getPayment().getId() : null,
                employerContribution,
                affiliateContribution,
                employerContribution.add(affiliateContribution),
                quote.getDaysContributed(),
                quote.getContribDate(),
                quote.getStatus() != null ? quote.getStatus().name() : null,
                quote.getReviewedBy() != null ? quote.getReviewedBy().getUserId() : null,
                quote.getReviewedAt(),
                quote.getComment()
        );
    }

    private void validatePagination(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("INVALID_PAGINATION", "Page and limit must be greater than zero");
        }
    }

    private String normalizeComment(ReviewQuoteRequestDto request) {
        if (request == null || request.comment() == null || request.comment().isBlank()) {
            return null;
        }
        return request.comment().trim();
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
