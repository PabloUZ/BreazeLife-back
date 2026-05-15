package com.highdev.breazelife.modules.document.repository;


import com.highdev.breazelife.modules.document.entity.AffiliateDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AffiliateDocumentRepository extends JpaRepository<AffiliateDocument, String> {

    List<AffiliateDocument> findByAffiliateIdOrderByGeneratedAtDesc(String affiliateId);

    Optional<AffiliateDocument> findByIdAndAffiliateId(String id, String affiliateId);
}