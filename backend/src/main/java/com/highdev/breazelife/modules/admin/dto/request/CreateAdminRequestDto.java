package com.highdev.breazelife.modules.admin.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAdminRequestDto(

        @JsonProperty("first_name")
        @NotBlank
        @Size(min = 1, max = 30)
        String firstName,

        @JsonProperty("last_name")
        @NotBlank
        @Size(min = 1, max = 30)
        String lastName,

        @JsonProperty("email")
        @NotBlank
        @Email
        String email,

        @JsonProperty("password")
        @NotBlank
        @Size(min = 8)
        String password

) {}

