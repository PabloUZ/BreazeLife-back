package com.highdev.breazelife.modules.auth.service;

import com.highdev.breazelife.config.JwtService;
import com.highdev.breazelife.modules.auth.dto.request.LoginRequest;
import com.highdev.breazelife.modules.auth.dto.request.RefreshTokenRequest;
import com.highdev.breazelife.modules.auth.dto.request.SignupRequest;
import com.highdev.breazelife.modules.auth.dto.response.LoginResponse;
import com.highdev.breazelife.modules.auth.dto.response.RefreshTokenResponse;
import com.highdev.breazelife.modules.auth.dto.response.SignupResponse;
import com.highdev.breazelife.modules.auth.exception.InvalidCredentialsException;
import com.highdev.breazelife.modules.auth.exception.InvalidRefreshTokenException;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.exception.EmailAlreadyExistsException;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public SignupResponse signup(SignupRequest request) {
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

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        return LoginResponse.of(jwtService.generateAccessToken(user), jwtService.generateRefreshToken(user));
    }

    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        Claims claims;
        try {
            claims = jwtService.parse(request.refreshToken());
        } catch (JwtException e) {
            throw new InvalidRefreshTokenException();
        }
        if (!jwtService.isRefreshToken(claims)) {
            throw new InvalidRefreshTokenException();
        }
        User user = userRepository.findById(claims.getSubject())
                .orElseThrow(InvalidRefreshTokenException::new);
        return RefreshTokenResponse.of(jwtService.generateAccessToken(user), jwtService.generateRefreshToken(user));
    }
}
