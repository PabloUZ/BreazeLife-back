package com.highdev.breazelife.modules.admin.service;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.admin.dto.request.CreateAdminRequestDto;
import com.highdev.breazelife.modules.admin.dto.request.SuspendAccountRequestDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountActionResponseDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountDetailDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountListItemDto;
import com.highdev.breazelife.modules.admin.dto.response.CreateAdminResponseDto;
import com.highdev.breazelife.modules.admin.entity.Admin;
import com.highdev.breazelife.modules.admin.exceptions.AdminAccountActionException;
import com.highdev.breazelife.modules.admin.exceptions.AdminAccountDetailException;
import com.highdev.breazelife.modules.admin.exceptions.AdminAccountListException;
import com.highdev.breazelife.modules.admin.repository.AdminRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import com.highdev.breazelife.shared.dto.PaginationMeta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminAccountService {

    public record AdminAccountsPage(List<AdminAccountListItemDto> accounts, PaginationMeta pagination) {}

    private final UserRepository userRepository;
    private final AffiliateRepository affiliateRepository;
    private final EmployerRepository employerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountService(
            UserRepository userRepository,
            AffiliateRepository affiliateRepository,
            EmployerRepository employerRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.affiliateRepository = affiliateRepository;
        this.employerRepository = employerRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CreateAdminResponseDto createAdmin(CreateAdminRequestDto request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("EMAIL_ALREADY_EXISTS", "Email already in use");
        }
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(User.Role.ADMIN);
        user.setVerified(true);
        userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(user);
        adminRepository.save(admin);

        return new CreateAdminResponseDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Transactional(readOnly = true)
    public AdminAccountsPage getAccounts(int page, int limit, String role, String status, Boolean verified, String search) {
        try {
            validatePagination(page, limit);

            String normalizedRole = normalizeRole(role);
            String normalizedStatus = normalizeStatus(status);
            String normalizedSearch = normalizeSearch(search);

            Page<UserRepository.AdminAccountListProjection> result = userRepository.findAdminAccounts(
                    normalizedRole,
                    normalizedStatus,
                    verified,
                    normalizedSearch,
                    PageRequest.of(page - 1, limit)
            );

            List<AdminAccountListItemDto> accounts = result.getContent().stream()
                    .map(projection -> new AdminAccountListItemDto(
                            projection.getUserId(),
                            projection.getRole(),
                            projection.getFirstName(),
                            projection.getLastName(),
                            projection.getEmail(),
                            projection.getVerified(),
                            projection.getStatus(),
                            projection.getDocument(),
                            projection.getNit(),
                            projection.getCompanyName()
                    ))
                    .toList();

            return new AdminAccountsPage(accounts, new PaginationMeta(page, limit, result.getTotalElements()));
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminAccountListException(ex);
        }
    }

    @Transactional(readOnly = true)
    public AdminAccountDetailDto getAccountById(String userId) {
        try {
            User user = findManageableUser(userId);

            return switch (user.getRole()) {
                case AFFILIATE -> buildAffiliateDetail(user, loadAffiliate(userId));
                case EMPLOYER -> buildEmployerDetail(user, loadEmployer(userId));
                default -> throw invalidManageableRole();
            };
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminAccountDetailException(ex);
        }
    }

    @Transactional
    public AdminAccountActionResponseDto verifyAccount(String userId) {
        try {
            User user = findManageableUser(userId);

            if (!Boolean.TRUE.equals(user.getVerified())) {
                user.setVerified(true);
                userRepository.save(user);
            }

            return switch (user.getRole()) {
                case AFFILIATE -> {
                    Affiliate affiliate = loadAffiliate(userId);
                    yield toActionResponse(user, affiliate.getStatus().name(), affiliate.getSuspendedReason());
                }
                case EMPLOYER -> {
                    Employer employer = loadEmployer(userId);
                    yield toActionResponse(user, employer.getStatus().name(), employer.getSuspendedReason());
                }
                default -> throw invalidManageableRole();
            };
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminAccountActionException("ADMIN_ACCOUNT_VERIFY_ERROR", "Failed to verify account", ex);
        }
    }

    @Transactional
    public AdminAccountActionResponseDto suspendAccount(String userId, SuspendAccountRequestDto request) {
        try {
            User user = findManageableUser(userId);
            String reason = normalizeReason(request);

            return switch (user.getRole()) {
                case AFFILIATE -> suspendAffiliate(user, reason);
                case EMPLOYER -> suspendEmployer(user, reason);
                default -> throw invalidManageableRole();
            };
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminAccountActionException("ADMIN_ACCOUNT_SUSPEND_ERROR", "Failed to suspend account", ex);
        }
    }

    @Transactional
    public AdminAccountActionResponseDto activateAccount(String userId) {
        try {
            User user = findManageableUser(userId);

            return switch (user.getRole()) {
                case AFFILIATE -> activateAffiliate(user);
                case EMPLOYER -> activateEmployer(user);
                default -> throw invalidManageableRole();
            };
        } catch (BadRequestException | NotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdminAccountActionException("ADMIN_ACCOUNT_ACTIVATE_ERROR", "Failed to activate account", ex);
        }
    }

    private AdminAccountDetailDto buildAffiliateDetail(User user, Affiliate affiliate) {
        return new AdminAccountDetailDto(
                user.getId(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getVerified(),
                affiliate.getStatus().name(),
                affiliate.getSuspendedReason(),
                new AdminAccountDetailDto.AffiliateInfo(
                        affiliate.getDocument(),
                        affiliate.getBirthDate(),
                        affiliate.getPhoneNumber(),
                        affiliate.getAffiliationDate()
                ),
                null
        );
    }

    private AdminAccountDetailDto buildEmployerDetail(User user, Employer employer) {
        return new AdminAccountDetailDto(
                user.getId(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getVerified(),
                employer.getStatus().name(),
                employer.getSuspendedReason(),
                null,
                new AdminAccountDetailDto.EmployerInfo(
                        employer.getNit(),
                        employer.getCompanyName(),
                        employer.getSector(),
                        employer.getNameLegalRep(),
                        employer.getIdLegalRep()
                )
        );
    }

    private AdminAccountActionResponseDto suspendAffiliate(User user, String reason) {
        Affiliate affiliate = loadAffiliate(user.getId());

        if (affiliate.getStatus() != Affiliate.Status.SUSPENDED) {
            affiliate.setStatus(Affiliate.Status.SUSPENDED);
            affiliate.setSuspendedReason(reason);
            affiliateRepository.save(affiliate);
        }

        return toActionResponse(user, affiliate.getStatus().name(), affiliate.getSuspendedReason());
    }

    private AdminAccountActionResponseDto suspendEmployer(User user, String reason) {
        Employer employer = loadEmployer(user.getId());

        if (employer.getStatus() != Employer.Status.SUSPENDED) {
            employer.setStatus(Employer.Status.SUSPENDED);
            employer.setSuspendedReason(reason);
            employerRepository.save(employer);
        }

        return toActionResponse(user, employer.getStatus().name(), employer.getSuspendedReason());
    }

    private AdminAccountActionResponseDto activateAffiliate(User user) {
        Affiliate affiliate = loadAffiliate(user.getId());

        if (affiliate.getStatus() != Affiliate.Status.ACTIVE) {
            affiliate.setStatus(Affiliate.Status.ACTIVE);
            affiliate.setSuspendedReason(null);
            affiliateRepository.save(affiliate);
        }

        return toActionResponse(user, affiliate.getStatus().name(), affiliate.getSuspendedReason());
    }

    private AdminAccountActionResponseDto activateEmployer(User user) {
        Employer employer = loadEmployer(user.getId());

        if (employer.getStatus() != Employer.Status.ACTIVE) {
            employer.setStatus(Employer.Status.ACTIVE);
            employer.setSuspendedReason(null);
            employerRepository.save(employer);
        }

        return toActionResponse(user, employer.getStatus().name(), employer.getSuspendedReason());
    }

    private User findManageableUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND", "Account not found with id: " + userId));

        if (user.getRole() != User.Role.AFFILIATE && user.getRole() != User.Role.EMPLOYER) {
            throw invalidManageableRole();
        }

        return user;
    }

    private Affiliate loadAffiliate(String userId) {
        return affiliateRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("AFFILIATE_NOT_FOUND", "Affiliate profile not found for user id: " + userId));
    }

    private Employer loadEmployer(String userId) {
        return employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", "Employer profile not found for user id: " + userId));
    }

    private AdminAccountActionResponseDto toActionResponse(User user, String status, String suspendedReason) {
        return new AdminAccountActionResponseDto(
                user.getId(),
                user.getRole().name(),
                user.getVerified(),
                status,
                suspendedReason
        );
    }

    private void validatePagination(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("INVALID_PAGINATION", "Page and limit must be greater than zero");
        }
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }

        String normalizedRole = role.trim().toUpperCase();
        if (!normalizedRole.equals(User.Role.AFFILIATE.name()) && !normalizedRole.equals(User.Role.EMPLOYER.name())) {
            throw new BadRequestException("INVALID_ACCOUNT_ROLE", "Role must be AFFILIATE or EMPLOYER");
        }

        return normalizedRole;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!normalizedStatus.equals(Affiliate.Status.ACTIVE.name())
                && !normalizedStatus.equals(Affiliate.Status.SUSPENDED.name())
                && !normalizedStatus.equals(Affiliate.Status.INACTIVE.name())) {
            throw new BadRequestException("INVALID_ACCOUNT_STATUS", "Status must be ACTIVE, SUSPENDED, or INACTIVE");
        }

        return normalizedStatus;
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }

    private String normalizeReason(SuspendAccountRequestDto request) {
        if (request == null || request.reason() == null || request.reason().isBlank()) {
            return null;
        }
        return request.reason().trim();
    }

    private BadRequestException invalidManageableRole() {
        return new BadRequestException("INVALID_ACCOUNT_ROLE", "Only AFFILIATE and EMPLOYER accounts can be managed from this endpoint");
    }
}
