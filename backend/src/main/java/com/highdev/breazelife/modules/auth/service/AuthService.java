package com.highdev.breazelife.modules.auth.service;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.modules.auth.dto.request.SignupRequest;
import com.highdev.breazelife.modules.auth.dto.response.SignupResponse;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.exception.EmailAlreadyExistsException;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SignupResponse signup(SignupRequest request) {
        if (request.role() == User.Role.ADMIN) {
            throw new BadRequestException("INVALID_INPUT", "Invalid input data");
        }

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
        userRepository.save(user);

        return new SignupResponse(user.getId(), user.getEmail(), false);
    }
}
