package com.kresehazirlik.service;

import com.kresehazirlik.domain.Child;
import com.kresehazirlik.repo.Repos;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

/** Ebeveyn yalnızca kendi çocuklarının verisine erişebilir. Tüm çocuk uçları buradan geçer. */
@Service
public class ChildAccessService {
    private final Repos.ChildRepo children;
    public ChildAccessService(Repos.ChildRepo children) { this.children = children; }

    public Child requireOwned(UUID childId, UUID parentId) {
        return children.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kayıt bulunamadı"));
    }
}
