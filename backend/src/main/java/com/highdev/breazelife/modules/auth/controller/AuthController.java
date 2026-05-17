package com.highdev.breazelife.modules.auth.controller;

import com.highdev.breazelife.modules.auth.dto.request.LoginRequest;
import com.highdev.breazelife.modules.auth.dto.request.RefreshTokenRequest;
import com.highdev.breazelife.modules.auth.dto.request.SignupRequest;
import com.highdev.breazelife.modules.auth.dto.response.LoginResponse;
import com.highdev.breazelife.modules.auth.dto.response.RefreshTokenResponse;
import com.highdev.breazelife.modules.auth.dto.response.SignupResponse;
import com.highdev.breazelife.modules.auth.service.AuthService;
import com.highdev.breazelife.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse data = authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.of("User registered successfully.", 201, "CREATED", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.of("Login successful", 200, "OK", data));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse data = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.of("Token refreshed successfully", 200, "OK", data));
    }
}
