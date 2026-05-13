package com.highdev.breazelife.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PaginationMeta(

        @JsonProperty("page")
        int page,

        @JsonProperty("limit")
        int limit,

        @JsonProperty("total")
        long total

) {}
