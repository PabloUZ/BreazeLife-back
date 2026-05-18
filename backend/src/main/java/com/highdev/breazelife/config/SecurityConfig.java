package com.highdev.breazelife.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.highdev.breazelife.shared.handlers.CustomForbiddenHandler;
import com.highdev.breazelife.shared.handlers.CustomUnauthorizedHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUnauthorizedHandler customUnauthorizedHandler;
    private final CustomForbiddenHandler customForbiddenHandler;

    public SecurityConfig(CustomUnauthorizedHandler customUnauthorizedHandler,
                          CustomForbiddenHandler customForbiddenHandler) {
        this.customUnauthorizedHandler = customUnauthorizedHandler;
        this.customForbiddenHandler = customForbiddenHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(customUnauthorizedHandler)
                .accessDeniedHandler(customForbiddenHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/api/v1/auth/**",
                    "/**"
                ).permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
