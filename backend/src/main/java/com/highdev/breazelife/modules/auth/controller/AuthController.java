package com.highdev.breazelife.modules.auth.controller;

import com.highdev.breazelife.modules.auth.dto.request.SignupRequest;
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
                .body(ApiResponse.of(
                        "User registered successfully.",
                        201, "CREATED", data));
    }
}
