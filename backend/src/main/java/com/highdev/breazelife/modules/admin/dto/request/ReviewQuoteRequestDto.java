package com.highdev.breazelife.modules.admin.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public record ReviewQuoteRequestDto(

        @JsonProperty("comment")
        @Size(max = 1000)
        String comment

) {}
