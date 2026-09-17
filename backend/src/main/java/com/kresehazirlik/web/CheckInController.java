package com.kresehazirlik.web;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.dto.Dtos.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate; import java.util.*;

@RestController @RequestMapping("/api/v1/children/{childId}")
@Transactional(readOnly = true)   // lazy observations open-in-view kapalıyken de okunabilsin
public class CheckInController {
    private final Repos.CheckInRepo checkIns; private final Repos.EnrollmentRepo enrollments;
    private final ChildAccessService access; private final CheckInQuestionService questions; private final TrendService trends;

    public CheckInController(Repos.CheckInRepo checkIns, Repos.EnrollmentRepo enrollments,
                             ChildAccessService access, CheckInQuestionService questions, TrendService trends) {
        this.checkIns = checkIns; this.enrollments = enrollments;
        this.access = access; this.questions = questions; this.trends = trends;
    }

    /** Günün formu: en fazla 4-5 soru, 1-2 dakikada tamamlanacak şekilde. */
    @GetMapping("/checkins/today")
    public TodayFormResponse today(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        SchoolEnrollment e = enrollments.findByChildId(childId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Önce okul bilgisi girilmeli"));
        LocalDate today = LocalDate.now();
        int day = CheckInQuestionService.schoolDay(e.getStartDate(), today);
        var picked = questions.pick(c.getId(), e.getStartDate(), today, new HashSet<>(List.of(e.getFocusAreas())));
        var existing = checkIns.findByChildIdAndCheckInDateAndSource(childId, today, ObservationSource.PARENT)
                .map(this::toResponse).orElse(null);
        return new TodayFormResponse(today, day, CheckInQuestionService.phaseOf(day), day >= 1 && day <= 30,
                picked.stream().map(i -> new QuestionResponse(i.code(), i.text(), i.areaCode(), i.optionLabels())).toList(),
                existing);
    }

    @PostMapping("/checkins") @Transactional
    public CheckInResponse save(@PathVariable UUID childId, @Valid @RequestBody CheckInRequest req) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        DailyCheckIn ci = checkIns.findByChildIdAndCheckInDateAndSource(childId, req.date(), ObservationSource.PARENT)
                .orElseGet(DailyCheckIn::new);
        ci.setChild(c); ci.setCheckInDate(req.date()); ci.setOverallMood(req.overallMood());
        ci.setNote(req.note()); ci.setSource(ObservationSource.PARENT);
        ci.getObservations().clear();
        if (req.items() != null) req.items().forEach((code, value) -> {
            var item = CheckInQuestionService.byCode(code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bilinmeyen madde: " + code));
            Observation o = new Observation();
            o.setCheckIn(ci); o.setItemCode(code); o.setAreaCode(item.areaCode()); o.setValue(value);
            ci.getObservations().add(o);
        });
        return toResponse(checkIns.save(ci));
    }

    @GetMapping("/checkins")
    public List<CheckInResponse> history(@PathVariable UUID childId,
                                         @RequestParam(required=false) LocalDate from,
                                         @RequestParam(required=false) LocalDate to) {
        access.requireOwned(childId, CurrentParent.id());
        LocalDate end = to == null ? LocalDate.now() : to;
        LocalDate start = from == null ? end.minusDays(89) : from;
        return checkIns.findWindowWithObservations(childId, ObservationSource.PARENT, start, end)
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/trends")
    public TrendResponse trends(@PathVariable UUID childId, @RequestParam(defaultValue="7") int window) {
        access.requireOwned(childId, CurrentParent.id());
        LocalDate today = LocalDate.now();
        var b = trends.buckets(childId, today);
        return new TrendResponse(window,
                trends.findings(childId, today).stream().map(f -> new FindingResponse(f.kind(), f.text())).toList(),
                Map.<String, Object>of("strong", b.strong(), "emerging", b.emerging(), "supportable", b.supportable()),
                trends.referralHint(childId, today).orElse(null));
    }

    @GetMapping("/comparison")
    public Map<String, Object> comparison(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        LocalDate today = LocalDate.now();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("items", trends.parentVsTeacher(childId, today));
        out.put("teacherEntryCount", trends.teacherEntryCount(childId, today));
        out.put("lastTeacherObservedOn",
                trends.lastTeacherObservation(childId, today).map(LocalDate::toString).orElse(null));
        out.put("note", "Ebeveyn ve öğretmen gözlemleri ayrı tutulur; farklı olmaları olağandır. "
                + "Çocuklar evde ve okulda farklı davranabilir.");
        return out;
    }

    private CheckInResponse toResponse(DailyCheckIn ci) {
        Map<String, Short> items = new LinkedHashMap<>();
        ci.getObservations().forEach(o -> items.put(o.getItemCode(), o.getValue()));
        return new CheckInResponse(ci.getCheckInDate(), ci.getOverallMood(), items, ci.getNote(), ci.getSource().name());
    }
}
