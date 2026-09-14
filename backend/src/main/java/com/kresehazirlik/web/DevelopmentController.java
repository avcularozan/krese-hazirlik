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

    /** Yalnızca çocuğun kronolojik yaşına uygun maddeler döner. */
    @GetMapping("/children/{childId}/development/skills")
    public List<SkillResponse> skills(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        short m = (short) c.ageMonths();
        return skills.findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(m, m).stream()
                .map(s -> new SkillResponse(s.getId(), s.getCode(), s.getTextTr(), s.getArea().getCode())).toList();
    }

    @PostMapping("/children/{childId}/development/observations") @Transactional
    public Map<String, Object> observe(@PathVariable UUID childId, @Valid @RequestBody SkillObservationRequest req) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        DevelopmentSkill skill = skills.findById(req.skillId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beceri bulunamadı"));
        SkillObservation o = new SkillObservation();
        o.setChild(c); o.setSkill(skill);
        o.setLevel(SkillLevel.valueOf(req.level()));
        o.setObservedOn(req.observedOn() == null ? LocalDate.now() : req.observedOn());
        o.setNote(req.note());
        skillObs.save(o);
        return Map.<String, Object>of("status", "ok");
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
