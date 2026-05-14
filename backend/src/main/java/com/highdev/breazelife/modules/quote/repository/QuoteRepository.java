package com.highdev.breazelife.modules.quote.repository;

import com.highdev.breazelife.modules.quote.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, String> {

    Page<Quote> findByStatus(Quote.QuoteStatus status, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdOrderByContribDateDesc(String affiliateUserId, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdAndStatus(String affiliateUserId, Quote.QuoteStatus status, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdAndContribDateBetweenOrderByContribDateDesc(String affiliateUserId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Optional<Quote> findByIdAndAccountAffiliateUserId(String id, String affiliateUserId);

    long countByStatus(Quote.QuoteStatus status);

    @Query("SELECT q FROM Quote q WHERE q.accountId = :accountId " +
            "AND (:status IS NULL OR q.status = :status) " +
            "AND (:from IS NULL OR q.contribDate >= :from) " +
            "AND (:to IS NULL OR q.contribDate <= :to)")
    Page<Quote> findByFilters(
        @Param("accountId") String accountId,
        @Param("status") Quote.QuoteStatus status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

    @Query("SELECT q FROM Quote q WHERE q.accountId = :accountId " +
            "AND q.status = 'ACCEPTED' " +
            "ORDER BY q.contribDate ASC")
    java.util.List<Quote> findAcceptedByAccountId(@Param("accountId") String accountId);
}
