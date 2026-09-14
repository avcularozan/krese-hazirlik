package com.kresehazirlik.web;

import org.springframework.security.core.context.SecurityContextHolder;
import java.util.UUID;

public final class CurrentParent {
    private CurrentParent() {}
    public static UUID id() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (UUID) p;
    }
}
