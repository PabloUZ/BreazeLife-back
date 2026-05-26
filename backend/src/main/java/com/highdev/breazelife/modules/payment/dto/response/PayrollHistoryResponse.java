package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PayrollHistoryResponse {

    private List<PayrollHistoryItemDTO> items;
    private Pagination pagination;

    public static class Pagination {
        private int page;
        private int limit;
        @JsonProperty("total_items") private long totalItems;
        @JsonProperty("total_pages") private int totalPages;

        public Pagination(int page, int limit, long totalItems) {
            this.page = page;
            this.limit = limit;
            this.totalItems = totalItems;
            this.totalPages = limit > 0 ? (int) Math.ceil((double) totalItems / limit) : 0;
        }

        public int getPage() { return page; }
        public int getLimit() { return limit; }
        public long getTotalItems() { return totalItems; }
        public int getTotalPages() { return totalPages; }
    }

    public List<PayrollHistoryItemDTO> getItems() { return items; }
    public void setItems(List<PayrollHistoryItemDTO> items) { this.items = items; }

    public Pagination getPagination() { return pagination; }
    public void setPagination(Pagination pagination) { this.pagination = pagination; }
}
