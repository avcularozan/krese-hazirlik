package com.kresehazirlik.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate; import java.util.*;

public class Dtos {
    public record RegisterRequest(@Email @NotBlank String email,
                                  @Size(min=8, max=100) String password,
                                  String displayName) {}
    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
    public record TokenResponse(String accessToken, String refreshToken) {}
    public record RefreshRequest(@NotBlank String refreshToken) {}

    /** Fotoğraf yok; gerçek ad zorunlu değil. Minimum veri toplanır. */
    public record ChildRequest(@NotBlank @Size(max=80) String nickname,
                               @NotNull @Past LocalDate birthDate,
                               boolean usesRealName) {}
    public record ChildResponse(UUID id, String nickname, LocalDate birthDate, int ageMonths,
                                Integer schoolDay, EnrollmentResponse enrollment) {}

    public record EnrollmentRequest(String schoolName, @NotNull LocalDate startDate, String groupName,
                                    String hadPreviousSchool, String dailyHours, List<String> focusAreas) {}
    public record EnrollmentResponse(String schoolName, LocalDate startDate, String groupName,
                                     String hadPreviousSchool, String dailyHours, List<String> focusAreas,
                                     LocalDate adaptationStartedOn) {}

    public record QuestionResponse(String code, String text, String areaCode, List<String> optionLabels) {}
    public record TodayFormResponse(LocalDate date, int schoolDay, int phase, boolean inAdaptationProgram,
                                    List<QuestionResponse> questions, CheckInResponse existing) {}

    /** value: 0-3, null = "gözlemleme fırsatım olmadı" (hiçbir ortalamaya girmez). */
    public record CheckInRequest(@NotNull LocalDate date,
                                 @Min(1) @Max(4) Short overallMood,
                                 Map<String, Short> items,
                                 @Size(max=500) String note) {}
    public record CheckInResponse(LocalDate date, Short overallMood, Map<String, Short> items,
                                  String note, String source) {}

    public record SkillResponse(UUID id, String code, String text, String areaCode) {}
    public record SkillObservationRequest(@NotNull UUID skillId, @NotBlank String level, LocalDate observedOn, String note) {}

    public record ActivityResponse(String code, String title, String areaCode, String goal,
                                   List<String> materials, int durationMinutes,
                                   List<String> steps, List<String> parentTips) {}

    public record TeacherCodeResponse(UUID id, String code, String url, java.time.Instant expiresAt) {}
    public record TeacherObservationRequest(String teacherAlias, LocalDate observedOn,
                                            Map<String, Short> items, @Size(max=500) String note) {}

    public record FindingResponse(String kind, String text) {}
    public record TrendResponse(int windowDays, List<FindingResponse> findings,
                                Map<String, Object> buckets, String referralHint) {}
}
