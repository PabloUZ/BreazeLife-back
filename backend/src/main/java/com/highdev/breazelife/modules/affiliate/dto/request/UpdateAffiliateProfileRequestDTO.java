package com.highdev.breazelife.modules.affiliate.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateAffiliateProfileRequestDTO(

        @JsonProperty("email")
        @Email(message = "Invalid email format")
        @Size(max = 255)
        String email,

        @JsonProperty("phone")
        @Size(max = 20)
        String phone,

        @JsonProperty("current_password")
        String currentPassword,

        @JsonProperty("new_password")
        @Size(min = 8, max = 255, message = "New password must be at least 8 characters")
        String newPassword,

        @JsonProperty("account_type")
        String accountType

) {}
