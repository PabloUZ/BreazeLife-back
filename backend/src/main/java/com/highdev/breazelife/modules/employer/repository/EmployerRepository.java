package com.highdev.breazelife.modules.employer.repository;

import com.highdev.breazelife.modules.employer.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, String> {

    Optional<Employer> findByNit(String nit);

    boolean existsByNit(String nit);
}
