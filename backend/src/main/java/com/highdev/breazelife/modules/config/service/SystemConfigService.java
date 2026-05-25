package com.highdev.breazelife.modules.config.service;

import com.highdev.breazelife.modules.config.dto.request.UpdateSystemConfigRequestDto;
import com.highdev.breazelife.modules.config.dto.response.SystemConfigResponseDto;
import com.highdev.breazelife.modules.config.entity.SystemConfig;
import com.highdev.breazelife.modules.config.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SystemConfigService {

    // ── Claves canónicas ──────────────────────────────────────────────────────
    public static final String KEY_RATE_CONSERVATIVE = "rate.conservative";
    public static final String KEY_RATE_MODERATE     = "rate.moderate";
    public static final String KEY_RATE_RISKY        = "rate.risky";
    public static final String KEY_LIFE_EXPECTANCY   = "life.expectancy";
    public static final String KEY_CONTRIBUTION_RATE = "contribution.rate";

    // ── Valores por defecto ───────────────────────────────────────────────────
    private static final BigDecimal DEFAULT_RATE_CONSERVATIVE = new BigDecimal("0.004");
    private static final BigDecimal DEFAULT_RATE_MODERATE     = new BigDecimal("0.006");
    private static final BigDecimal DEFAULT_RATE_RISKY        = new BigDecimal("0.008");
    private static final int        DEFAULT_LIFE_EXPECTANCY   = 62;
    private static final BigDecimal DEFAULT_CONTRIBUTION_RATE = new BigDecimal("0.16");

    private final SystemConfigRepository repository;

    public SystemConfigService(SystemConfigRepository repository) {
        this.repository = repository;
    }

    // ── GET ───────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SystemConfigResponseDto getConfig() {
        return new SystemConfigResponseDto(
                getDecimal(KEY_RATE_CONSERVATIVE, DEFAULT_RATE_CONSERVATIVE),
                getDecimal(KEY_RATE_MODERATE,     DEFAULT_RATE_MODERATE),
                getDecimal(KEY_RATE_RISKY,        DEFAULT_RATE_RISKY),
                getInt(KEY_LIFE_EXPECTANCY,        DEFAULT_LIFE_EXPECTANCY),
                getDecimal(KEY_CONTRIBUTION_RATE, DEFAULT_CONTRIBUTION_RATE)
        );
    }

    // ── PUT ───────────────────────────────────────────────────────────────────

    @Transactional
    public SystemConfigResponseDto updateConfig(UpdateSystemConfigRequestDto request) {
        upsert(KEY_RATE_CONSERVATIVE, request.rateConservative().toPlainString());
        upsert(KEY_RATE_MODERATE,     request.rateModerate().toPlainString());
        upsert(KEY_RATE_RISKY,        request.rateRisky().toPlainString());
        upsert(KEY_LIFE_EXPECTANCY,   String.valueOf(request.lifeExpectancy()));
        upsert(KEY_CONTRIBUTION_RATE, request.contributionRate().toPlainString());
        return getConfig();
    }

    // ── Acceso público para otros servicios ──────────────────────────────────

    public BigDecimal getRateConservative() {
        return getDecimal(KEY_RATE_CONSERVATIVE, DEFAULT_RATE_CONSERVATIVE);
    }

    public BigDecimal getRateModerate() {
        return getDecimal(KEY_RATE_MODERATE, DEFAULT_RATE_MODERATE);
    }

    public BigDecimal getRateRisky() {
        return getDecimal(KEY_RATE_RISKY, DEFAULT_RATE_RISKY);
    }

    public BigDecimal getContributionRate() {
        return getDecimal(KEY_CONTRIBUTION_RATE, DEFAULT_CONTRIBUTION_RATE);
    }

    public int getLifeExpectancy() {
        return getInt(KEY_LIFE_EXPECTANCY, DEFAULT_LIFE_EXPECTANCY);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void upsert(String key, String value) {
        SystemConfig config = repository.findByKey(key)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setKey(key);
                    return c;
                });
        config.setValue(value);
        repository.save(config);
    }

    private BigDecimal getDecimal(String key, BigDecimal defaultValue) {
        return repository.findByKey(key)
                .map(c -> new BigDecimal(c.getValue()))
                .orElse(defaultValue);
    }

    private int getInt(String key, int defaultValue) {
        return repository.findByKey(key)
                .map(c -> Integer.parseInt(c.getValue()))
                .orElse(defaultValue);
    }
}

