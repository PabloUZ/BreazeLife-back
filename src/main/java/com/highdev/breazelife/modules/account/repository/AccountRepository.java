package com.highdev.breazelife.modules.account.repository;

import com.highdev.breazelife.modules.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    Optional<Account> findByAffiliateUserId(String affiliateUserId);
}
