package com.highdev.breazelife.modules.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SignupResponse(

        @JsonProperty("user_id")
        String userId,

        @JsonProperty("email")
        String email,

        @JsonProperty("verified")
        Boolean verified

) {}
