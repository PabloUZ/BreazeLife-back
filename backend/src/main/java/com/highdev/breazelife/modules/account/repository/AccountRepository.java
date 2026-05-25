package com.highdev.breazelife.modules.account.repository;

import com.highdev.breazelife.modules.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    interface AccountTypeCountProjection {
        Account.AccountType getAccountType();
        Long getCount();
    }

    Optional<Account> findByAffiliateUserId(String affiliateUserId);

    @Query("select sum(a.balance) from Account a")
    BigDecimal sumAllBalances();

    @Query("""
            select a.accountType as accountType, count(a) as count
            from Account a
            where a.accountType is not null
            group by a.accountType
            """)
    List<AccountTypeCountProjection> countAccountsGroupedByType();
}
