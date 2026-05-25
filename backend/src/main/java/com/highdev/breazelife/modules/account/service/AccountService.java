package com.highdev.breazelife.modules.account.service;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository; // Asegúrate de que apunte a tu repositorio de afiliados
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AffiliateRepository affiliateRepository;

    @Transactional
    public Account createAccountForAffiliate(String affiliateUserId) {
        // Si ya tiene una cuenta creada, simplemente la retornamos para evitar duplicados
        return accountRepository.findByAffiliateUserId(affiliateUserId)
                .orElseGet(() -> {
                    // Buscamos la entidad completa del afiliado
                    Affiliate affiliate = affiliateRepository.findById(affiliateUserId)
                            .orElseThrow(() -> new NotFoundException("AFFILIATE_NOT_FOUND", 
                                    "No se encontró el afiliado con ID: " + affiliateUserId));

                    // Instanciamos el registro mínimo viable
                    Account newAccount = new Account();
                    newAccount.setAffiliate(affiliate);
                    newAccount.setBalance(BigDecimal.ZERO);
                    newAccount.setAccountType(Account.AccountType.MODERATE); // Tipo por defecto
                    newAccount.setQuotedDays(0);

                    return accountRepository.save(newAccount);
                });
    }
}