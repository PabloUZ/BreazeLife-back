package com.highdev.breazelife.modules.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highdev.breazelife.modules.user.entity.User;

public record MeResponse(

        @JsonProperty("user_id")
        String userId,

        @JsonProperty("first_name")
        String firstName,

        @JsonProperty("last_name")
        String lastName,

        @JsonProperty("email")
        String email,

        @JsonProperty("role")
        User.Role role,

        @JsonProperty("verified")
        Boolean verified

) {
    public static MeResponse from(User user) {
        return new MeResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getVerified()
        );
    }
}
