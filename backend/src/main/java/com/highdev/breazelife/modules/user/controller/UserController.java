package com.highdev.breazelife.modules.user.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.highdev.breazelife.modules.user.dto.request.CreateUserRequest;
import com.highdev.breazelife.modules.user.dto.request.UpdateUserRequest;
import com.highdev.breazelife.modules.user.dto.response.UserResponse;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.service.UserService;
import com.highdev.breazelife.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest request) {
        UserResponse data = userService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.of("User created successfully", 201, "CREATED", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) String email
    ) {
        UserService.UsersPage result = userService.findAll(page, limit, role, verified, email);
        return ResponseEntity.ok(ApiResponse.of("Users retrieved successfully", 200, "OK", result.users(), result.pagination()));
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable("user_id") String userId) {
        UserResponse data = userService.findById(userId);
        return ResponseEntity.ok(ApiResponse.of("User retrieved successfully", 200, "OK", data));
    }

    @DeleteMapping("/{user_id}")
    public ResponseEntity<Void> delete(@PathVariable("user_id") String userId) {
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{user_id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable("user_id") String userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse data = userService.update(userId, request);
        return ResponseEntity.ok(ApiResponse.of("User updated successfully", 200, "OK", data));
    }
}
