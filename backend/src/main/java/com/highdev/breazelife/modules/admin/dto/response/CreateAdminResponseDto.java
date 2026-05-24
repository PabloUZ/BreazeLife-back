package com.highdev.breazelife.modules.admin.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateAdminResponseDto(

        @JsonProperty("id")
        String id,

        @JsonProperty("first_name")
        String firstName,

        @JsonProperty("last_name")
        String lastName,

        @JsonProperty("email")
        String email,

        @JsonProperty("role")
        String role

) {}

