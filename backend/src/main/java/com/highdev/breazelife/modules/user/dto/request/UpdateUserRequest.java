package com.highdev.breazelife.modules.user.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

    @JsonProperty("first_name")
    @Size(min = 1, max = 30)
    private String firstName;

    @JsonProperty("last_name")
    @Size(min = 1, max = 30)
    private String lastName;

    @JsonProperty("email")
    @Email
    private String email;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
