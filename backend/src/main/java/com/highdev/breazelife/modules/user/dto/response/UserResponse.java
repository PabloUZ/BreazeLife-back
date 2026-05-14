package com.highdev.breazelife.modules.user.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highdev.breazelife.modules.user.entity.User;

public record UserResponse(

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
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getVerified()
        );
    }
}
