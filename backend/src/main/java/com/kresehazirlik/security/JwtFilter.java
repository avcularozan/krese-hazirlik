package com.kresehazirlik.security;

import jakarta.servlet.*; import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List; import java.util.UUID;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    public JwtFilter(JwtService jwt) { this.jwt = jwt; }

    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                UUID parentId = jwt.parse(h.substring(7), "access");
                var auth = new UsernamePasswordAuthenticationToken(parentId, null,
                        List.of(new SimpleGrantedAuthority("ROLE_PARENT")));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) { SecurityContextHolder.clearContext(); }
        }
        chain.doFilter(req, res);
    }
}
