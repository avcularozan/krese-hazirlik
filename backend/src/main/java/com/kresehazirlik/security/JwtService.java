package com.kresehazirlik.security;

import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.*; import java.util.*;

@Service
public class JwtService {
    private final SecretKey key;
    private final long accessTtlMinutes;
    private final long refreshTtlDays;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-ttl-minutes}") long accessTtlMinutes,
                      @Value("${app.jwt.refresh-ttl-days}") long refreshTtlDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlMinutes = accessTtlMinutes;
        this.refreshTtlDays = refreshTtlDays;
    }

    public String accessToken(UUID parentId) { return build(parentId, "access", Duration.ofMinutes(accessTtlMinutes)); }
    public String refreshToken(UUID parentId) { return build(parentId, "refresh", Duration.ofDays(refreshTtlDays)); }

    private String build(UUID parentId, String type, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder().subject(parentId.toString()).claim("typ", type)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plus(ttl)))
                .signWith(key).compact();
    }

    public UUID parse(String token, String expectedType) {
        Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        if (!expectedType.equals(c.get("typ", String.class))) throw new JwtException("Beklenmeyen token türü");
        return UUID.fromString(c.getSubject());
    }
}
