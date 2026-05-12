package com.highdev.breazelife.modules.affiliate.repository;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AffiliateRepository extends JpaRepository<Affiliate, String> {

    Optional<Affiliate> findByDocument(String document);

    boolean existsByDocument(String document);

    boolean existsByPhoneNumber(String phoneNumber);
}
