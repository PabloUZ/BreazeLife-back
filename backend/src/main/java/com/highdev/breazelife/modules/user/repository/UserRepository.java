package com.highdev.breazelife.modules.user.repository;

import com.highdev.breazelife.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {

    interface AdminAccountListProjection {
        String getUserId();
        String getRole();
        String getFirstName();
        String getLastName();
        String getEmail();
        Boolean getVerified();
        String getStatus();
        String getDocument();
        String getNit();
        String getCompanyName();
    }

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query(value = """
            select
                u.id as userId,
                u.role as role,
                u.first_name as firstName,
                u.last_name as lastName,
                u.email as email,
                u.verified as verified,
                case
                    when u.role = 'AFFILIATE' then a.status
                    when u.role = 'EMPLOYER' then e.status
                end as status,
                a.document as document,
                e.nit as nit,
                e.company_name as companyName
            from users u
            left join affiliates a on a.user_id = u.id
            left join employers e on e.user_id = u.id
            where u.role in ('AFFILIATE', 'EMPLOYER')
              and (:role is null or u.role = :role)
              and (:verified is null or u.verified = :verified)
              and (
                    :status is null or
                    (u.role = 'AFFILIATE' and a.status = :status) or
                    (u.role = 'EMPLOYER' and e.status = :status)
              )
              and (
                    :search is null or
                    lower(u.first_name) like lower(concat('%', :search, '%')) or
                    lower(u.last_name) like lower(concat('%', :search, '%')) or
                    lower(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) like lower(concat('%', :search, '%')) or
                    lower(u.email) like lower(concat('%', :search, '%')) or
                    lower(coalesce(a.document, '')) like lower(concat('%', :search, '%')) or
                    lower(coalesce(e.nit, '')) like lower(concat('%', :search, '%')) or
                    lower(coalesce(e.company_name, '')) like lower(concat('%', :search, '%'))
              )
            """,
            countQuery = """
            select count(*)
            from users u
            left join affiliates a on a.user_id = u.id
            left join employers e on e.user_id = u.id
            where u.role in ('AFFILIATE', 'EMPLOYER')
              and (:role is null or u.role = :role)
              and (:verified is null or u.verified = :verified)
              and (
                    :status is null or
                    (u.role = 'AFFILIATE' and a.status = :status) or
                    (u.role = 'EMPLOYER' and e.status = :status)
              )
              and (
                    :search is null or
                    lower(u.first_name) like lower(concat('%', :search, '%')) or
                    lower(u.last_name) like lower(concat('%', :search, '%')) or
                    lower(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) like lower(concat('%', :search, '%')) or
                    lower(u.email) like lower(concat('%', :search, '%')) or
                    lower(coalesce(a.document, '')) like lower(concat('%', :search, '%')) or
                    lower(coalesce(e.nit, '')) like lower(concat('%', :search, '%')) or
                    lower(coalesce(e.company_name, '')) like lower(concat('%', :search, '%'))
              )
            """,
            nativeQuery = true)
    Page<AdminAccountListProjection> findAdminAccounts(
            @Param("role") String role,
            @Param("status") String status,
            @Param("verified") Boolean verified,
            @Param("search") String search,
            Pageable pageable
    );
}
