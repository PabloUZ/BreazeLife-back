package com.highdev.breazelife.modules.admin.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public record SuspendAccountRequestDto(

        @JsonProperty("reason")
        @Size(max = 500)
        String reason

) {}
