package com.highdev.breazelife.modules.affiliate.dto.response;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.user.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AffiliateProfileResponseDTO(
        String userId,
        String firstName,
        String lastName,
        String email,
        String role,
        Boolean verified,
        String document,
        LocalDate birthDate,
        LocalDate affiliationDate,
        String phone,
        String status,
        AccountInfo account
) {
    public record AccountInfo(
            String accountId,
            String accountType,
            BigDecimal balance,
            Integer quotedDays
    ) {}

    public static AffiliateProfileResponseDTO from(Affiliate affiliate, Account account) {
        User user = affiliate.getUser();
        AccountInfo accountInfo = account != null
                ? new AccountInfo(
                        account.getId(),
                        account.getAccountType() != null ? account.getAccountType().name() : null,
                        account.getBalance(),
                        account.getQuotedDays()
                  )
                : null;

        return new AffiliateProfileResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getVerified(),
                affiliate.getDocument(),
                affiliate.getBirthDate(),
                affiliate.getAffiliationDate(),
                affiliate.getPhoneNumber(),
                affiliate.getStatus().name(),
                accountInfo
        );
    }
}
