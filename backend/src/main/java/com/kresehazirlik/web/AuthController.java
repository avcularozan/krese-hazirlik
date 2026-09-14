package com.kresehazirlik.web;

import com.kresehazirlik.domain.Parent;
import com.kresehazirlik.dto.Dtos.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant; import java.util.Map; import java.util.UUID;

@RestController @RequestMapping("/api/v1")
public class AuthController {
    private final Repos.ParentRepo parents; private final PasswordEncoder encoder; private final JwtService jwt;

    public AuthController(Repos.ParentRepo parents, PasswordEncoder encoder, JwtService jwt) {
        this.parents = parents; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/auth/register") @Transactional
    public TokenResponse register(@Valid @RequestBody RegisterRequest req) {
        if (parents.findByEmail(req.email()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu e-posta zaten kayıtlı");
        Parent p = new Parent();
        p.setEmail(req.email().toLowerCase());
        p.setPasswordHash(encoder.encode(req.password()));
        p.setDisplayName(req.displayName());
        p.setConsentAt(Instant.now());
        parents.save(p);
        return new TokenResponse(jwt.accessToken(p.getId()), jwt.refreshToken(p.getId()));
    }

    @PostMapping("/auth/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest req) {
        Parent p = parents.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-posta veya şifre hatalı"));
        if (!encoder.matches(req.password(), p.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-posta veya şifre hatalı");
        return new TokenResponse(jwt.accessToken(p.getId()), jwt.refreshToken(p.getId()));
    }

    @PostMapping("/auth/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest req) {
        UUID id = jwt.parse(req.refreshToken(), "refresh");
        return new TokenResponse(jwt.accessToken(id), jwt.refreshToken(id));
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        Parent p = parents.findById(CurrentParent.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return Map.<String, Object>of("id", p.getId(), "email", p.getEmail(), "displayName",
                p.getDisplayName() == null ? "" : p.getDisplayName());
    }

    /** Hesabı ve tüm çocuk verilerini geri dönüşsüz siler (cascade). */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteAccount() { parents.deleteById(CurrentParent.id()); }
}
