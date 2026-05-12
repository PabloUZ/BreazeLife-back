package com.highdev.breazelife.modules.quote.repository;

import com.highdev.breazelife.modules.quote.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
