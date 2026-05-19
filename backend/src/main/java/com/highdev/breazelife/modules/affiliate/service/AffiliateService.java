package com.highdev.breazelife.modules.affiliate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highdev.breazelife.modules.quote.dto.response.BalanceHistoryResponseDTO;
import com.highdev.breazelife.modules.quote.dto.response.PagedResponseDTO;
import com.highdev.breazelife.modules.quote.dto.response.PayslipResponseDTO;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Módulo User (Donde vive la clase padre o asociada)
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.ConflictException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.common.exceptions.http.UnauthorizedException;
import com.highdev.breazelife.modules.affiliate.dto.request.UpdateAffiliateProfileRequestDTO;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateProfileResponseDTO;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateDashboardResponseDTO;
import com.highdev.breazelife.modules.profitability.entity.ProfitabilityHistory;
import com.highdev.breazelife.modules.profitability.repository.ProfitabilityHistoryRepository;


import java.util.ArrayList;
import java.util.Collections;

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

        @Autowired
        private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        @Transactional
        public UpdateProfileResult updateProfile(String affiliateId, UpdateAffiliateProfileRequestDTO request) {
                Affiliate affiliate = affiliateRepository.findById(affiliateId)
                        .orElseThrow(() -> new NotFoundException("AFFILIATE_NOT_FOUND",
                                "Affiliate not found"));

                if (request.email() == null && request.phone() == null
                        && request.newPassword() == null && request.accountType() == null) {
                        throw new BadRequestException("NO_FIELDS_TO_UPDATE",
                                "At least one field must be provided");
                }

                User user = affiliate.getUser();
                Account account = accountRepository.findByAffiliateUserId(affiliateId)
                        .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND",
                                "Pension account not found for this affiliate"));

                if (request.email() != null && !request.email().equals(user.getEmail())) {
                        if (userRepository.existsByEmail(request.email())) {
                                throw new ConflictException("EMAIL_ALREADY_IN_USE",
                                        "Email is already in use");
                        }
                        user.setEmail(request.email());
                }

                if (request.phone() != null && !request.phone().equals(affiliate.getPhoneNumber())) {
                        if (affiliateRepository.existsByPhoneNumber(request.phone())) {
                                throw new ConflictException("PHONE_ALREADY_IN_USE",
                                        "Phone number is already registered by another affiliate");
                        }
                        affiliate.setPhoneNumber(request.phone());
                }

                if (request.newPassword() != null) {
                        if (request.currentPassword() == null) {
                                throw new BadRequestException("CURRENT_PASSWORD_REQUIRED",
                                        "Current password is required to set a new password");
                        }
                        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                                throw new UnauthorizedException("INVALID_CURRENT_PASSWORD",
                                        "Current password is incorrect");
                        }
                        user.setPassword(passwordEncoder.encode(request.newPassword()));
                }

                if (request.accountType() != null) {
                        try {
                                account.setAccountType(Account.AccountType.valueOf(request.accountType()));
                        } catch (IllegalArgumentException e) {
                                throw new BadRequestException("INVALID_ACCOUNT_TYPE",
                                        "Invalid account type. Allowed values: CONSERVATIVE, MODERATE, RISKY");
                        }
                        accountRepository.save(account);
                }

                userRepository.save(user);
                affiliateRepository.save(affiliate);

                return new UpdateProfileResult(user.getId(), user.getEmail(),
                        affiliate.getPhoneNumber(),
                        account.getAccountType() != null ? account.getAccountType().name() : null);
        }

        public record UpdateProfileResult(String userId, String email, String phone, String accountType) {}

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



        //MÉTODO DE LAS COLILLAS DE PAGO
        // Cambiamos la firma para recibir from y to
        public PagedResponseDTO<PayslipResponseDTO> getPayslips(String affiliateId, LocalDate from, LocalDate to, int page, int size) {
        
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new AffiliateNotFoundException(affiliateId));
                
        // Validar rango y convertir a LocalDateTime (igual que en getQuoteHistory)
        if (from != null && to != null && from.isAfter(to)) throw new InvalidDateRangeException();
        LocalDateTime fromDT = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDT = to != null ? to.atTime(23, 59, 59) : null;

        Affiliate affiliate = account.getAffiliate();
        String fullName = affiliate.getUser().getFirstName() + " " + affiliate.getUser().getLastName();
        String document = affiliate.getDocument();

        // Usamos el NUEVO método del repositorio con los filtros
        Page<Quote> quotesPage = quoteRepository.findPayslipsByFilters(
                affiliateId, fromDT, toDT, PageRequest.of(page, size));

        List<PayslipResponseDTO> content = quotesPage.getContent().stream().map(quote -> {
                
                BigDecimal grossSalary = quote.getAffiliateContrib().divide(new BigDecimal("0.04"), 2, java.math.RoundingMode.HALF_UP);
                BigDecimal netSalaryReceived = grossSalary.subtract(quote.getAffiliateContrib());
                BigDecimal totalContrib = quote.getEmployerContrib().add(quote.getAffiliateContrib());
                String periodString = quote.getContribDate().getMonth().name() + " " + quote.getContribDate().getYear();

                return PayslipResponseDTO.builder()
                        .affiliateName(fullName)
                        .affiliateDocument(document)
                        .period(periodString)
                        .grossSalary(grossSalary)
                        .pensionDeduction(quote.getAffiliateContrib())
                        .netSalaryReceived(netSalaryReceived)
                        .employerContrib(quote.getEmployerContrib())
                        .totalContrib(totalContrib)
                        .status(quote.getStatus().name())
                        .build();
        }).collect(Collectors.toList());

        return new PagedResponseDTO<>(quotesPage.getTotalElements(), quotesPage.getTotalPages(), quotesPage.getNumber(), content);
        }



        public List<BalanceHistoryResponseDTO> getBalanceHistory(String affiliateId) {
        // 1. Validar que la cuenta existe (reutilizando tu excepción estándar)
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new AffiliateNotFoundException(affiliateId));

        // 2. Obtener cotizaciones aceptadas en orden cronológico (antiguas primero)
        List<Quote> acceptedQuotes = quoteRepository.findAllAcceptedQuotesByAffiliateAsc(affiliateId);

        List<BalanceHistoryResponseDTO> historyList = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO; // Nuestro acumulador de saldo

        // 3. Algoritmo de acumulación lineal
        for (Quote quote : acceptedQuotes) {
                BigDecimal employer = quote.getEmployerContrib() != null ? quote.getEmployerContrib() : BigDecimal.ZERO;
                BigDecimal affiliate = quote.getAffiliateContrib() != null ? quote.getAffiliateContrib() : BigDecimal.ZERO;
                
                // El valor total que entra a la bolsa en esta fecha (16%)
                BigDecimal totalContribution = employer.add(affiliate);

                // Se suma progresivamente al saldo total
                runningBalance = runningBalance.add(totalContribution);

                // Construimos el registro histórico
                BalanceHistoryResponseDTO historyNode = BalanceHistoryResponseDTO.builder()
                        .contributionDate(quote.getContribDate())
                        .contributionValue(totalContribution)
                        .resultingBalance(runningBalance)
                        .build();

                historyList.add(historyNode);
        }

        // 4. Invertimos la lista para la comodidad de la UI (más reciente primero)
        Collections.reverse(historyList);

        return historyList;
        }
}
