package com.highdev.breazelife.modules.profitability.service;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.config.service.SystemConfigService;
import com.highdev.breazelife.modules.profitability.dto.response.ApplyProfitabilityResponseDto;
import com.highdev.breazelife.modules.profitability.dto.response.ProfitabilityHistoryPeriodDto;
import com.highdev.breazelife.modules.profitability.entity.ProfitabilityHistory;
import com.highdev.breazelife.modules.profitability.repository.ProfitabilityHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ProfitabilityService {

    private final AccountRepository accountRepository;
    private final ProfitabilityHistoryRepository profitabilityHistoryRepository;
    private final SystemConfigService systemConfigService;

    public ProfitabilityService(AccountRepository accountRepository,
                                ProfitabilityHistoryRepository profitabilityHistoryRepository,
                                SystemConfigService systemConfigService) {
        this.accountRepository = accountRepository;
        this.profitabilityHistoryRepository = profitabilityHistoryRepository;
        this.systemConfigService = systemConfigService;
    }

    @Transactional
    public ApplyProfitabilityResponseDto applyMonthlyProfitability() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        if (profitabilityHistoryRepository.existsByDateBetween(firstDayOfMonth, lastDayOfMonth)) {
            throw new BadRequestException(
                    "PROFITABILITY_ALREADY_APPLIED",
                    "Monthly profitability has already been applied for " +
                    today.getMonth().name() + " " + today.getYear()
            );
        }

        // Leer tasas desde system_config (con fallback a defaults)
        Map<Account.AccountType, BigDecimal> monthlyRates = Map.of(
                Account.AccountType.CONSERVATIVE, systemConfigService.getRateConservative(),
                Account.AccountType.MODERATE,     systemConfigService.getRateModerate(),
                Account.AccountType.RISKY,        systemConfigService.getRateRisky()
        );

        List<Account> accounts = accountRepository.findAll();
        List<ApplyProfitabilityResponseDto.AccountProfitDetailDto> details = new ArrayList<>();
        BigDecimal totalProfit = BigDecimal.ZERO;
        int processed = 0;

        for (Account account : accounts) {
            if (account.getAccountType() == null || account.getBalance() == null) {
                continue;
            }

            BigDecimal rate = monthlyRates.get(account.getAccountType());
            if (rate == null) continue;

            BigDecimal previousBalance = account.getBalance();

            // Rentabilidad del mes = Saldo acumulado × Tasa mensual
            BigDecimal profit = previousBalance.multiply(rate).setScale(2, RoundingMode.HALF_UP);

            // Nuevo saldo = Saldo acumulado + Rentabilidad del mes
            BigDecimal newBalance = previousBalance.add(profit);
            account.setBalance(newBalance);
            accountRepository.save(account);

            // Registrar en historial de rentabilidad
            ProfitabilityHistory history = new ProfitabilityHistory();
            history.setAccount(account);
            history.setProfit(profit);
            history.setDate(today);
            profitabilityHistoryRepository.save(history);

            details.add(new ApplyProfitabilityResponseDto.AccountProfitDetailDto(
                    account.getId(),
                    account.getAccountType().name(),
                    rate,
                    previousBalance,
                    profit,
                    newBalance
            ));

            totalProfit = totalProfit.add(profit);
            processed++;
        }

        return new ApplyProfitabilityResponseDto(today, processed, totalProfit, details);
    }

    public List<ProfitabilityHistoryPeriodDto> getProfitabilityHistory() {
        List<Object[]> rows = profitabilityHistoryRepository.findHistoryGroupedByDate();
        List<ProfitabilityHistoryPeriodDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            long count = (long) row[1];
            BigDecimal total = (BigDecimal) row[2];

            String period = date.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "CO"))
                    + " " + date.getYear();

            result.add(new ProfitabilityHistoryPeriodDto(period, date, count, total));
        }

        return result;
    }
}

