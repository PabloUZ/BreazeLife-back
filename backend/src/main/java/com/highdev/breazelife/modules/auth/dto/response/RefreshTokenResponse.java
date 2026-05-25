package com.highdev.breazelife.modules.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RefreshTokenResponse(

        @JsonProperty("access_token")
        String accessToken,

        @JsonProperty("refresh_token")
        String refreshToken,

        @JsonProperty("token_type")
        String tokenType,

        @JsonProperty("expires_in")
        long expiresIn

) {
    public static RefreshTokenResponse of(String accessToken, String refreshToken) {
        return new RefreshTokenResponse(accessToken, refreshToken, "Bearer", 3600L);
    }
}
