package com.highdev.breazelife.modules.quote.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.highdev.breazelife.modules.quote.dto.response.PagedResponseDTO;
import com.highdev.breazelife.modules.quote.dto.response.QuoteResponseDTO;
import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuoteService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    public PagedResponseDTO<QuoteResponseDTO> getQuoteHistory(
            String affiliateId,
            Quote.QuoteStatus status,
            LocalDate from,
            LocalDate to,
            int page,
            int size
    ) {
        // 1. Buscar la cuenta del afiliado
        Account account = getAffiliateAccount(affiliateId);

        // 2. Validar rango de fechas
        validateDateRange(from, to);

        // 3. Convertir fechas a LocalDateTime
        LocalDateTime fromDT = convertToLocalDateTime(from, true);
        LocalDateTime toDT = convertToLocalDateTime(to, false);

        // 4. Consultar cotizaciones con filtros
        Page<Quote> quotesPage = quoteRepository.findByFilters(
                account.getId(), status, fromDT, toDT,
                PageRequest.of(page, size)
        );

        // 5. Mapear a DTOs
        List<QuoteResponseDTO> content = quotesPage.getContent()
                .stream()
                .map(this::mapToQuoteResponseDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                quotesPage.getTotalElements(),
                quotesPage.getTotalPages(),
                quotesPage.getNumber(),
                content
        );
    }

    private QuoteResponseDTO mapToQuoteResponseDTO(Quote quote) {
        QuoteResponseDTO dto = new QuoteResponseDTO();
        dto.setQuoteId(quote.getId());
        dto.setEmployerContrib(quote.getEmployerContrib());
        dto.setAffiliateContrib(quote.getAffiliateContrib());

        // Calcular total_contrib = employer + affiliate
        if (quote.getEmployerContrib() != null && quote.getAffiliateContrib() != null) {
            dto.setTotalContrib(quote.getEmployerContrib().add(quote.getAffiliateContrib()));
        }

        dto.setDaysContributed(quote.getDaysContributed());
        dto.setContribDate(quote.getContribDate());
        dto.setStatus(quote.getStatus() != null ? quote.getStatus().name() : null);
        dto.setReviewedBy(quote.getReviewedBy().getUserId());
        dto.setReviewedAt(quote.getReviewedAt());
        dto.setComment(quote.getComment());

        // Mapear payment si existe
        if (quote.getPayment() != null) {
            QuoteResponseDTO.PaymentDTO paymentDTO = new QuoteResponseDTO.PaymentDTO();
            paymentDTO.setPaymentId(quote.getPayment().getId());
            // net_salary y gross_salary vendrán cuando el módulo 7
            // tenga su entidad Payment lista
            dto.setPayment(paymentDTO);
        }

        return dto;
    }

    private Account getAffiliateAccount(String affiliateId) {
        return accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new AffiliateNotFoundException(affiliateId));
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new InvalidDateRangeException();
        }
    }

    private LocalDateTime convertToLocalDateTime(LocalDate date, boolean isStart) {
        if (date == null) {
            return null;
        }
        return isStart ? date.atStartOfDay() : date.atTime(23, 59, 59);
    }

    


}

