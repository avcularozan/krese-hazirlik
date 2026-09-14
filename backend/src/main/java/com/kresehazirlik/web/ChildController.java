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

@RestController @RequestMapping("/api/v1/children")
@Transactional(readOnly = true)
public class ChildController {
    private final Repos.ChildRepo children; private final Repos.ParentRepo parents;
    private final Repos.EnrollmentRepo enrollments; private final ChildAccessService access;

    public ChildController(Repos.ChildRepo children, Repos.ParentRepo parents,
                           Repos.EnrollmentRepo enrollments, ChildAccessService access) {
        this.children = children; this.parents = parents; this.enrollments = enrollments; this.access = access;
    }

    @GetMapping
    public List<ChildResponse> list() {
        return children.findByParentId(CurrentParent.id()).stream().map(this::toResponse).toList();
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public ChildResponse create(@Valid @RequestBody ChildRequest req) {
        Child c = new Child();
        c.setParent(parents.getReferenceById(CurrentParent.id()));
        c.setNickname(req.nickname());
        c.setBirthDate(req.birthDate());
        c.setUsesRealName(req.usesRealName());
        return toResponse(children.save(c));
    }

    @GetMapping("/{childId}")
    public ChildResponse get(@PathVariable UUID childId) {
        return toResponse(access.requireOwned(childId, CurrentParent.id()));
    }

    @DeleteMapping("/{childId}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void delete(@PathVariable UUID childId) {
        children.delete(access.requireOwned(childId, CurrentParent.id()));
    }

    @PostMapping("/{childId}/enrollment") @Transactional
    public EnrollmentResponse upsertEnrollment(@PathVariable UUID childId, @Valid @RequestBody EnrollmentRequest req) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        SchoolEnrollment e = enrollments.findByChildId(childId).orElseGet(SchoolEnrollment::new);
        e.setChild(c);
        e.setSchoolName(req.schoolName());
        e.setStartDate(req.startDate());
        e.setGroupName(req.groupName());
        e.setHadPreviousSchool(req.hadPreviousSchool());
        e.setDailyHours(req.dailyHours());
        e.setFocusAreas(req.focusAreas() == null ? new String[0] : req.focusAreas().toArray(String[]::new));
        // Başlangıç 30 günden yeniyse okula uyum yolculuğu başlar.
        if (!req.startDate().isBefore(LocalDate.now().minusDays(30))) e.setAdaptationStartedOn(req.startDate());
        return toEnrollment(enrollments.save(e));
    }

    @GetMapping("/{childId}/enrollment")
    public EnrollmentResponse enrollment(@PathVariable UUID childId) {
        access.requireOwned(childId, CurrentParent.id());
        return enrollments.findByChildId(childId).map(this::toEnrollment)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Okul bilgisi girilmemiş"));
    }

    private ChildResponse toResponse(Child c) {
        var e = enrollments.findByChildId(c.getId()).orElse(null);
        Integer day = e == null ? null : CheckInQuestionService.schoolDay(e.getStartDate(), LocalDate.now());
        return new ChildResponse(c.getId(), c.getNickname(), c.getBirthDate(), c.ageMonths(), day,
                e == null ? null : toEnrollment(e));
    }
    private EnrollmentResponse toEnrollment(SchoolEnrollment e) {
        return new EnrollmentResponse(e.getSchoolName(), e.getStartDate(), e.getGroupName(),
                e.getHadPreviousSchool(), e.getDailyHours(), List.of(e.getFocusAreas()), e.getAdaptationStartedOn());
    }
}
