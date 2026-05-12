package com.highdev.breazelife.modules.contract.repository;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.contract.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {

    Page<Contract> findByEmployerUserId(String employerUserId, Pageable pageable);

    Page<Contract> findByEmployerUserIdAndAffiliateStatus(String employerUserId, Affiliate.Status status, Pageable pageable);

    Optional<Contract> findByIdAndEmployerUserId(String id, String employerUserId);

    List<Contract> findByEmployerUserIdAndAffiliateStatus(String employerUserId, Affiliate.Status status);
}
