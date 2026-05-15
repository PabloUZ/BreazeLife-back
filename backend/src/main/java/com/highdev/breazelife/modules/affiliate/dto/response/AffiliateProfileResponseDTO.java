package com.highdev.breazelife.modules.affiliate.dto.response;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.user.entity.User;

import java.time.LocalDate;

public record AffiliateProfileResponseDTO(
        String userId,
        String firstName,
        String lastName,
        String email,
        String role,
        String document,
        LocalDate birthDate,
        String phoneNumber,
        LocalDate affiliationDate,
        String status,
        String accountType
) {
    public static AffiliateProfileResponseDTO from(Affiliate affiliate, Account account) {
        User user = affiliate.getUser();
        return new AffiliateProfileResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                affiliate.getDocument(),
                affiliate.getBirthDate(),
                affiliate.getPhoneNumber(),
                affiliate.getAffiliationDate(),
                affiliate.getStatus().name(),
                account != null && account.getAccountType() != null
                        ? account.getAccountType().name()
                        : null
        );
    }
}
