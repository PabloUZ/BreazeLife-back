package com.highdev.breazelife.modules.affiliate.dto.request;
import java.time.LocalDate;

public record AffiliateRequestDTO(
    String userId,
    String document,
    String firstName,
    String lastName,
    String email,
    String phoneNumber,
    LocalDate birthDate
) {}