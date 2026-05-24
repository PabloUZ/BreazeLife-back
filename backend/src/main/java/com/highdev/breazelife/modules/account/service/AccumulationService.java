package com.highdev.breazelife.modules.account.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.quote.exceptions.QuoteAlreadyProcessedException;

@Service
public class AccumulationService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Transactional
    public void processAccumulation(String affiliateId, String quoteId) {
        // 1. Buscar la cotización
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new NotFoundException("QUOTE_NOT_FOUND", 
                        "Contribution quote not found with ID: " + quoteId));

        // 2. Validar si ya fue procesada (Regla de negocio 3)
        if (quote.isProcessed()) {
            throw new QuoteAlreadyProcessedException(quoteId);
        }

        // 3. Buscar la cuenta del afiliado
        Account account = accountRepository.findByAffiliateUserId(affiliateId)
                .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND", 
                        "Pension account not found for affiliate ID: " + affiliateId));

        // 4. Ejecutar lógica en el Modelo de Dominio Rico (Account)
        // Aquí Account calcula el 16% del IBC y suma los días
        account.accumulateContribution(quote.getIbc(), quote.getDaysContributed());

        // 5. Cambiar estado de la cotización
        quote.markAsProcessed();

        // 6. Guardar cambios (Atomicidad por @Transactional)
        accountRepository.save(account);
        quoteRepository.save(quote);
    }
}