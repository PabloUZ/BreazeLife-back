package com.highdev.breazelife.modules.quote.repository;

import com.highdev.breazelife.modules.quote.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, String> {

    interface QuoteStatusCountProjection {
        Quote.QuoteStatus getStatus();
        Long getCount();
    }

    interface MonthlyContributionProjection {
        String getMonth();
        BigDecimal getTotalContribution();
    }

    Page<Quote> findByStatus(Quote.QuoteStatus status, Pageable pageable);

    Page<Quote> findByStatusOrderByContribDateDesc(Quote.QuoteStatus status, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdOrderByContribDateDesc(String affiliateUserId, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdAndStatus(String affiliateUserId, Quote.QuoteStatus status, Pageable pageable);

    Page<Quote> findByAccountAffiliateUserIdAndContribDateBetweenOrderByContribDateDesc(String affiliateUserId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Optional<Quote> findByIdAndAccountAffiliateUserId(String id, String affiliateUserId);

    Optional<Quote> findTopByAccountAffiliateUserIdAndStatusOrderByContribDateDesc(String affiliateUserId, Quote.QuoteStatus status);

    long countByStatus(Quote.QuoteStatus status);

    @Query("SELECT q FROM Quote q WHERE q.account.id = :accountId AND (:status IS NULL OR q.status = :status) AND (:from IS NULL OR q.contribDate >= :from) AND (:to IS NULL OR q.contribDate <= :to)")
    Page<Quote> findByFilters(
        @Param("accountId") String accountId,
        @Param("status") Quote.QuoteStatus status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

    @Query("SELECT q FROM Quote q WHERE q.account.id = :accountId AND q.status = 'ACCEPTED' ORDER BY q.contribDate ASC")
    List<Quote> findAcceptedByAccountId(@Param("accountId") String accountId);

    @Query("""
            select coalesce(sum(q.employerContrib), 0) + coalesce(sum(q.affiliateContrib), 0)
            from Quote q
            where q.status = :status
              and q.contribDate >= :from
              and q.contribDate < :to
            """)
    BigDecimal sumContributionsByStatusAndContribDateBetween(
            @Param("status") Quote.QuoteStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
            select q.status as status, count(q) as count
            from Quote q
            group by q.status
            """)
    List<QuoteStatusCountProjection> countQuotesGroupedByStatus();

    @Query("""
            select function('date_format', q.contribDate, '%Y-%m') as month,
                   coalesce(sum(q.employerContrib), 0) + coalesce(sum(q.affiliateContrib), 0) as totalContribution
            from Quote q
            where q.status = :status
              and q.contribDate is not null
            group by function('date_format', q.contribDate, '%Y-%m')
            order by function('date_format', q.contribDate, '%Y-%m')
            """)
    List<MonthlyContributionProjection> sumMonthlyContributionsByStatus(
            @Param("status") Quote.QuoteStatus status
    );
}
    Page<Quote> findByAccountAffiliateUserIdAndPaymentIsNotNullOrderByContribDateDesc(String affiliateId, Pageable pageable);
}
