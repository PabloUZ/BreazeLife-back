package com.highdev.breazelife.modules.account.service;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.exceptions.QuoteAlreadyProcessedException;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AccumulationService {

    public record AccumulationResult(
            String affiliateId,
            String accountId,
            String quoteId,
            BigDecimal accumulatedAmount,
            BigDecimal newBalance
    ) {}

    private final AccountRepository accountRepository;
    private final QuoteRepository quoteRepository;

    public AccumulationService(AccountRepository accountRepository, QuoteRepository quoteRepository) {
        this.accountRepository = accountRepository;
        this.quoteRepository = quoteRepository;
    }

    @Transactional
    public void processAccumulation(String affiliateId, String quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new NotFoundException(
                        "QUOTE_NOT_FOUND",
                        "Contribution quote not found with ID: " + quoteId
                ));

        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new NotFoundException(
                        "ACCOUNT_NOT_FOUND",
                        "Pension account not found for affiliate ID: " + affiliateId
                ));

        accumulateQuote(quote, account);
    }

    @Transactional
    public AccumulationResult processApprovedQuote(Quote quote) {
        if (quote == null) {
            throw new NotFoundException("QUOTE_NOT_FOUND", "Contribution quote not found");
        }

        Account account = quote.getAccount();
        if (account == null || account.getAffiliate() == null) {
            throw new NotFoundException(
                    "ACCOUNT_NOT_FOUND",
                    "Pension account not found for quote ID: " + quote.getId()
            );
        }

        return accumulateQuote(quote, account);
    }

    private AccumulationResult accumulateQuote(Quote quote, Account account) {
        if (quote.isProcessed()) {
            throw new QuoteAlreadyProcessedException(quote.getId());
        }

        BigDecimal accumulatedAmount = quote.getIbc() != null ? quote.getIbc() : BigDecimal.ZERO;
        int contributedDays = quote.getDaysContributed() != null ? quote.getDaysContributed() : 0;

        account.accumulateContribution(accumulatedAmount, contributedDays);
        quote.markAsProcessed();

        Account savedAccount = accountRepository.save(account);
        quoteRepository.save(quote);

        return new AccumulationResult(
                savedAccount.getAffiliate().getUserId(),
                savedAccount.getId(),
                quote.getId(),
                accumulatedAmount,
                savedAccount.getBalance()
        );
    }
}
