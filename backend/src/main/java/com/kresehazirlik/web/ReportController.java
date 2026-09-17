package com.kresehazirlik.web;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate; import java.util.*;

@RestController @RequestMapping("/api/v1/children/{childId}")
@Transactional(readOnly = true)
public class ReportController {
    private final Repos.MonthlyReportRepo reports; private final Repos.ReadinessRepo readiness;
    private final Repos.ReadinessAreaRepo readinessAreas; private final Repos.ReadinessItemRepo readinessItems;
    private final Repos.CheckInRepo checkIns; private final Repos.SkillObservationRepo skillObs;
    private final ChildAccessService access; private final TrendService trends;

    public ReportController(Repos.MonthlyReportRepo reports, Repos.ReadinessRepo readiness,
                            Repos.ReadinessAreaRepo readinessAreas, Repos.ReadinessItemRepo readinessItems,
                            Repos.CheckInRepo checkIns, Repos.SkillObservationRepo skillObs,
                            ChildAccessService access, TrendService trends) {
        this.readinessAreas = readinessAreas; this.readinessItems = readinessItems;
        this.reports = reports; this.readiness = readiness; this.checkIns = checkIns;
        this.skillObs = skillObs; this.access = access; this.trends = trends;
    }

    @PostMapping("/reports/monthly/generate") @Transactional
    public Map<String, Object> generate(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        LocalDate end = LocalDate.now(), start = end.minusDays(29);
        var b = trends.buckets(childId, end);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("strong", b.strong());
        payload.put("emerging", b.emerging());
        payload.put("supportable", b.supportable());
        payload.put("findings", trends.findings(childId, end));
        // Gelecek ay için en fazla 3 küçük hedef.
        payload.put("goals", b.supportable().stream().limit(3).map(TrendService.AreaScore::areaCode).toList());
        payload.put("disclaimer", "Bu rapor bir değerlendirme veya tanı değildir.");

        // Aynı dönem için yeniden üretildiğinde mevcut rapor tazelenir (child_id + period_start tekildir).
        MonthlyReport r = reports.findByChildIdAndPeriodStart(childId, start).orElseGet(MonthlyReport::new);
        r.setChild(c); r.setPeriodStart(start); r.setPeriodEnd(end); r.setPayload(payload);
        reports.save(r);
        return payload;
    }

    @GetMapping("/reports/monthly")
    public List<Map<String, Object>> monthly(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        return reports.findByChildIdOrderByPeriodStartDesc(childId).stream()
                .map(r -> Map.<String, Object>of("periodStart", r.getPeriodStart(),
                        "periodEnd", r.getPeriodEnd(), "payload", r.getPayload())).toList();
    }

    /** Okula hazırlık bölümü yalnızca 60 ay ve üzeri için açılır; "hazır/değil" kararı vermez. */
    @PostMapping("/readiness") @Transactional
    public Map<String, Object> saveReadiness(@PathVariable UUID childId, @RequestBody Map<String, Object> payload) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        if (c.ageMonths() < 60)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu bölüm çocuğunuz ilkokul dönemine yaklaştığında açılır");
        SchoolReadinessAssessment a = new SchoolReadinessAssessment();
        a.setChild(c); a.setAssessedOn(LocalDate.now()); a.setPayload(new LinkedHashMap<>(payload));
        readiness.save(a);
        return Map.<String, Object>of("status", "ok");
    }

    @GetMapping("/readiness")
    public List<Map<String, Object>> readiness(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        return readiness.findByChildIdOrderByAssessedOnDesc(childId).stream()
                .map(a -> Map.<String, Object>of("assessedOn", a.getAssessedOn(), "payload", a.getPayload())).toList();
    }

    /** Okula hazırlık madde kataloğu — 11 alan, 33 madde. */
    @GetMapping("/readiness/catalog")
    public List<Map<String, Object>> readinessCatalog(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        List<Map<String, Object>> out = new ArrayList<>();
        for (ReadinessArea a : readinessAreas.findAllByOrderBySortOrderAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("code", a.getCode());
            row.put("name", a.getNameTr());
            row.put("items", readinessItems.findByAreaIdOrderBySortOrderAsc(a.getId()).stream()
                    .map(i -> Map.of("code", i.getCode(), "text", i.getTextTr())).toList());
            out.add(row);
        }
        return out;
    }

    /** Tüm veriyi dışa aktarır (taşınabilirlik hakkı). */
    @GetMapping("/export")
    public Map<String, Object> export(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());

        List<Map<String, Object>> checkInRows = new ArrayList<>();
        for (DailyCheckIn ci : checkIns.findAllWithObservations(childId)) {
            Map<String, Short> items = new LinkedHashMap<>();
            for (Observation o : ci.getObservations()) items.put(o.getItemCode(), o.getValue());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", ci.getCheckInDate().toString());
            row.put("source", ci.getSource().name());
            row.put("mood", ci.getOverallMood());
            row.put("note", ci.getNote());
            row.put("items", items);
            checkInRows.add(row);
        }

        List<Map<String, Object>> skillRows = new ArrayList<>();
        for (SkillObservation o : skillObs.findByChildIdOrderByObservedOnDesc(childId)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("skill", o.getSkill().getCode());
            row.put("level", o.getLevel().name());
            row.put("observedOn", o.getObservedOn().toString());
            skillRows.add(row);
        }

        Map<String, Object> child = new LinkedHashMap<>();
        child.put("nickname", c.getNickname());
        child.put("birthDate", c.getBirthDate().toString());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("child", child);
        out.put("checkIns", checkInRows);
        out.put("skillObservations", skillRows);
        out.put("monthlyReports", reports.findByChildIdOrderByPeriodStartDesc(childId).stream()
                .map(MonthlyReport::getPayload).toList());
        return out;
    }
}
