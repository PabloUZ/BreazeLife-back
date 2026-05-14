package com.highdev.breazelife.modules.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.highdev.breazelife.modules.user.dto.request.CreateUserRequest;
import com.highdev.breazelife.modules.user.dto.request.UpdateUserRequest;
import com.highdev.breazelife.modules.user.dto.response.UserResponse;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.exception.EmailAlreadyExistsException;
import com.highdev.breazelife.modules.user.exception.UserNotFoundException;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import com.highdev.breazelife.shared.dto.PaginationMeta;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record UsersPage(List<UserResponse> users, PaginationMeta pagination) {}

    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException();
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setVerified(false);

        return UserResponse.from(userRepository.save(user));
    }

    public UsersPage findAll(int page, int limit, User.Role role, Boolean verified, String email) {
        Specification<User> spec = (root, q, cb) -> cb.conjunction();

        if (role != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("role"), role));
        if (verified != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("verified"), verified));
        if (email != null && !email.isBlank())
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));

        Page<User> result = userRepository.findAll(spec, PageRequest.of(page - 1, limit));

        List<UserResponse> users = result.getContent().stream().map(UserResponse::from).toList();
        PaginationMeta pagination = new PaginationMeta(page, limit, result.getTotalElements());

        return new UsersPage(users, pagination);
    }

    public UserResponse findById(String id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(UserNotFoundException::new);
    }

    public UserResponse update(String id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException();
        }

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());

        return UserResponse.from(userRepository.save(user));
    }

    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException();
        }
        userRepository.deleteById(id);
    }
}
