package com.kresehazirlik.web;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.dto.Dtos.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.service.ChildAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate; import java.util.*;

@RestController @RequestMapping("/api/v1")
@Transactional(readOnly = true)
public class DevelopmentController {
    private final Repos.AreaRepo areas; private final Repos.SkillRepo skills;
    private final Repos.SkillObservationRepo skillObs; private final ChildAccessService access;

    public DevelopmentController(Repos.AreaRepo areas, Repos.SkillRepo skills,
                                 Repos.SkillObservationRepo skillObs, ChildAccessService access) {
        this.areas = areas; this.skills = skills; this.skillObs = skillObs; this.access = access;
    }

    @GetMapping("/development/areas")
    public List<Map<String, Object>> areas() {
        return areas.findAllByOrderBySortOrderAsc().stream()
                .map(a -> Map.<String, Object>of("code", a.getCode(), "name", a.getNameTr())).toList();
    }

    /** Yalnızca çocuğun kronolojik yaşına uygun maddeler döner; her madde en son işaretlenen düzeyi taşır. */
    @GetMapping("/children/{childId}/development/skills")
    public List<SkillResponse> skills(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        short m = (short) c.ageMonths();

        // Tek sorgu, tarihe göre azalan: her beceri için ilk görülen kayıt en günceli olur.
        Map<UUID, SkillObservation> latest = new HashMap<>();
        for (SkillObservation o : skillObs.findByChildIdOrderByObservedOnDesc(childId))
            latest.putIfAbsent(o.getSkill().getId(), o);

        return skills.findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(m, m).stream()
                .map(s -> {
                    SkillObservation o = latest.get(s.getId());
                    return new SkillResponse(s.getId(), s.getCode(), s.getTextTr(), s.getArea().getCode(),
                            o == null ? null : o.getLevel().name(),
                            o == null ? null : o.getObservedOn());
                }).toList();
    }

    @PostMapping("/children/{childId}/development/observations") @Transactional
    public Map<String, Object> observe(@PathVariable UUID childId, @Valid @RequestBody SkillObservationRequest req) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        DevelopmentSkill skill = skills.findById(req.skillId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beceri bulunamadı"));
        LocalDate on = req.observedOn() == null ? LocalDate.now() : req.observedOn();

        // Aynı gün yeniden işaretlenirse yeni kayıt açılmaz, mevcut düzey güncellenir;
        // böylece tekrar tıklama ortalamaları şişirmez.
        SkillObservation o = skillObs
                .findByChildIdAndSkillIdAndObservedOnAndSource(childId, skill.getId(), on, ObservationSource.PARENT)
                .orElseGet(SkillObservation::new);
        o.setChild(c); o.setSkill(skill);
        o.setLevel(SkillLevel.valueOf(req.level()));
        o.setObservedOn(on);
        o.setNote(req.note());
        skillObs.save(o);
        return Map.<String, Object>of("status", "ok");
    }

    /** Bir becerinin zaman çizgisi: eskiden yeniye, ebeveynin kendi kayıtları. */
    @GetMapping("/children/{childId}/development/skills/{skillId}/history")
    public List<Map<String, Object>> history(@PathVariable UUID childId, @PathVariable UUID skillId) {
        access.requireOwned(childId, CurrentParent.id());
        return skillObs.findByChildIdAndSkillIdOrderByObservedOnAsc(childId, skillId).stream()
                .map(o -> Map.<String, Object>of(
                        "level", o.getLevel().name(),
                        "observedOn", o.getObservedOn().toString(),
                        "source", o.getSource().name()))
                .toList();
    }

    @GetMapping("/children/{childId}/development/summary")
    public Map<String, Object> summary(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        Map<String, List<Integer>> byArea = new HashMap<>();
        skillObs.findByChildIdOrderByObservedOnDesc(childId).forEach(o -> {
            Integer v = o.getLevel().value();          // NA ortalamaya girmez
            if (v != null) byArea.computeIfAbsent(o.getSkill().getArea().getCode(), k -> new ArrayList<>()).add(v);
        });
        Map<String, Object> out = new LinkedHashMap<>();
        byArea.forEach((area, vals) -> out.put(area, Map.of(
                "average", vals.stream().mapToInt(Integer::intValue).average().orElse(0),
                "observationCount", vals.size())));
        return Map.<String, Object>of("areas", out,
                "disclaimer", "Bu özet bir değerlendirme veya tanı değildir; yalnızca kendi kayıtlarınızın özetidir.");
    }
}
