package com.kresehazirlik.web;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.dto.Dtos.*;
import com.kresehazirlik.repo.Repos;
import com.kresehazirlik.service.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate; import java.util.*;

@RestController @RequestMapping("/api/v1")
@Transactional(readOnly = true)
public class ActivityController {
    private final Repos.ActivityRepo activities; private final ChildAccessService access; private final TrendService trends;

    public ActivityController(Repos.ActivityRepo activities, ChildAccessService access, TrendService trends) {
        this.activities = activities; this.access = access; this.trends = trends;
    }

    @GetMapping("/activities")
    public List<ActivityResponse> byAge(@RequestParam short ageMonths,
                                        @RequestParam(required=false) String areaCode) {
        return activities.findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(ageMonths, ageMonths).stream()
                .filter(a -> areaCode == null || a.getAreaCode().equals(areaCode))
                .map(ActivityController::toResponse).toList();
    }

    /** Desteklenebilecek alanlar önce gelir; yaş aralığı dışındaki etkinlikler hiç önerilmez. */
    @GetMapping("/children/{childId}/activities/suggested")
    public List<ActivityResponse> suggested(@PathVariable UUID childId) {
        Child c = access.requireOwned(childId, CurrentParent.id());
        short m = (short) c.ageMonths();
        var b = trends.buckets(childId, LocalDate.now());
        List<String> priority = new ArrayList<>();
        b.supportable().forEach(s -> priority.add(s.areaCode()));
        b.emerging().forEach(s -> priority.add(s.areaCode()));
        return activities.findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(m, m).stream()
                .sorted(Comparator.comparingInt((Activity a) -> {
                    int i = priority.indexOf(a.getAreaCode());
                    return i < 0 ? 99 : i;
                }))
                .limit(8).map(ActivityController::toResponse).toList();
    }

    private static ActivityResponse toResponse(Activity a) {
        return new ActivityResponse(a.getCode(), a.getTitleTr(), a.getAreaCode(), a.getGoalTr(),
                List.of(a.getMaterialsTr()), a.getDurationMinutes(), List.of(a.getStepsTr()), List.of(a.getParentTipsTr()));
    }
}
