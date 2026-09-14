package com.kresehazirlik.web;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.dto.Dtos.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.service.ChildAccessService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.*; import java.util.*;

/**
 * Öğretmen tarafı: hesap açması gerekmez.
 * Kod yalnızca gözlem yazmaya yarar; ebeveynin geçmiş kayıtlarını okumaz.
 */
@RestController @RequestMapping("/api/v1")
@Transactional(readOnly = true)
public class TeacherController {
    private static final SecureRandom RNG = new SecureRandom();

    private final Repos.TeacherCodeRepo codes; private final Repos.TeacherObsRepo observations;
    private final Repos.CheckInRepo checkIns; private final ChildAccessService access;
    private final PasswordEncoder encoder;
    private final int ttlDays; private final int maxUses; private final String baseUrl;

    public TeacherController(Repos.TeacherCodeRepo codes, Repos.TeacherObsRepo observations,
                             Repos.CheckInRepo checkIns, ChildAccessService access, PasswordEncoder encoder,
                             @Value("${app.teacher-code.ttl-days:30}") int ttlDays,
                             @Value("${app.teacher-code.max-uses:60}") int maxUses,
                             @Value("${app.base-url:https://app.kresehazirlik.local}") String baseUrl) {
        this.codes = codes; this.observations = observations; this.checkIns = checkIns;
        this.access = access; this.encoder = encoder;
        this.ttlDays = ttlDays; this.maxUses = maxUses; this.baseUrl = baseUrl;
    }

    @PostMapping("/children/{childId}/teacher-codes") @Transactional
    public TeacherCodeResponse create(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        codes.findByChildIdAndRevokedAtIsNull(childId).forEach(old -> { old.setRevokedAt(Instant.now()); codes.save(old); });
        String plain = String.format("%06d", RNG.nextInt(1_000_000));
        TeacherAccessCode code = new TeacherAccessCode();
        code.setChild(c);
        code.setCodeHash(encoder.encode(plain));
        code.setExpiresAt(Instant.now().plus(Duration.ofDays(ttlDays)));
        code.setMaxUses((short) maxUses);
        codes.save(code);
        // Düz kod yalnızca bu yanıtta döner; veritabanında hash tutulur.
        return new TeacherCodeResponse(code.getId(), plain, baseUrl + "/ogretmen/" + code.getId(), code.getExpiresAt());
    }

    @DeleteMapping("/children/{childId}/teacher-codes/{codeId}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void revoke(@PathVariable UUID childId, @PathVariable UUID codeId) {
        access.requireOwned(childId, CurrentParent.id());
        TeacherAccessCode code = codes.findById(codeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!code.getChild().getId().equals(childId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        code.setRevokedAt(Instant.now());
        codes.save(code);
    }

    /** Öğretmen formunun başlığı: çocuğun yalnızca takma adı ve grubu döner. */
    @GetMapping("/teacher/session")
    public Map<String, Object> session(@RequestParam UUID codeId, @RequestHeader("X-Access-Code") String accessCode) {
        TeacherAccessCode code = requireUsable(codeId, accessCode);
        return Map.<String, Object>of("childNickname", code.getChild().getNickname(), "expiresAt", code.getExpiresAt());
    }

    @PostMapping("/teacher/observations") @Transactional
    public Map<String, Object> submit(@RequestParam UUID codeId,
                                      @RequestHeader("X-Access-Code") String accessCode,
                                      @Valid @RequestBody TeacherObservationRequest req) {
        TeacherAccessCode code = requireUsable(codeId, accessCode);
        Child child = code.getChild();
        LocalDate on = req.observedOn() == null ? LocalDate.now() : req.observedOn();

        // Öğretmen gözlemi ayrı bir seri olarak saklanır (source = TEACHER).
        DailyCheckIn ci = checkIns.findByChildIdAndCheckInDateAndSource(child.getId(), on, ObservationSource.TEACHER)
                .orElseGet(DailyCheckIn::new);
        ci.setChild(child); ci.setCheckInDate(on); ci.setSource(ObservationSource.TEACHER); ci.setNote(req.note());
        ci.getObservations().clear();
        if (req.items() != null) req.items().forEach((itemCode, value) -> {
            var item = com.kresehazirlik.service.CheckInQuestionService.byCode(itemCode)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bilinmeyen madde: " + itemCode));
            Observation o = new Observation();
            o.setCheckIn(ci); o.setItemCode(itemCode); o.setAreaCode(item.areaCode()); o.setValue(value);
            ci.getObservations().add(o);
        });
        checkIns.save(ci);

        TeacherObservation obs = new TeacherObservation();
        obs.setChild(child); obs.setAccessCode(code); obs.setTeacherAlias(req.teacherAlias()); obs.setObservedOn(on);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", req.items() == null ? new LinkedHashMap<String, Short>() : req.items());
        payload.put("note", req.note() == null ? "" : req.note());
        obs.setPayload(payload);
        observations.save(obs);

        code.setUsedCount((short) (code.getUsedCount() + 1));
        codes.save(code);
        return Map.<String, Object>of("status", "ok", "observedOn", on.toString());
    }

    private TeacherAccessCode requireUsable(UUID codeId, String plain) {
        TeacherAccessCode code = codes.findById(codeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bağlantı geçersiz"));
        if (!code.isUsable() || !encoder.matches(plain, code.getCodeHash()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bağlantının süresi dolmuş veya iptal edilmiş");
        return code;
    }
}
