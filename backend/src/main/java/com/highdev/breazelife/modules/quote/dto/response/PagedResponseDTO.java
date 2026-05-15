package com.highdev.breazelife.modules.quote.dto.response;


import java.util.List;

public class PagedResponseDTO<T> {

    private long totalElements;
    private int totalPages;
    private int currentPage;
    private List<T> content;

    public PagedResponseDTO(long totalElements, int totalPages, int currentPage, List<T> content) {
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.content = content;
    }

    // Getters
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public int getCurrentPage() { return currentPage; }
    public List<T> getContent() { return content; }
}