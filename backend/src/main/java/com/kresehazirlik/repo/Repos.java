package com.kresehazirlik.repo;

import com.kresehazirlik.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate; import java.util.*;

public interface Repos {
    interface ParentRepo extends JpaRepository<Parent, UUID> { Optional<Parent> findByEmail(String email); }

    interface ChildRepo extends JpaRepository<Child, UUID> {
        List<Child> findByParentId(UUID parentId);
        Optional<Child> findByIdAndParentId(UUID id, UUID parentId);
    }

    interface EnrollmentRepo extends JpaRepository<SchoolEnrollment, UUID> {
        Optional<SchoolEnrollment> findByChildId(UUID childId);
    }

    interface CheckInRepo extends JpaRepository<DailyCheckIn, UUID> {
        Optional<DailyCheckIn> findByChildIdAndCheckInDateAndSource(UUID childId, LocalDate date, ObservationSource source);
        /**
         * Gözlemleri tek sorguda getirir. Trend ve geçmiş ekranları her kaydın gözlemlerini
         * okuduğu için, tembel yükleme burada kayıt sayısı kadar ek sorgu doğuruyordu.
         */
        @Query("""
               select distinct ci from DailyCheckIn ci
               left join fetch ci.observations
               where ci.child.id = :childId and ci.source = :source
                 and ci.checkInDate between :from and :to
               order by ci.checkInDate asc
               """)
        List<DailyCheckIn> findWindowWithObservations(@Param("childId") UUID childId,
                                                      @Param("source") ObservationSource source,
                                                      @Param("from") LocalDate from,
                                                      @Param("to") LocalDate to);

        @Query("""
               select distinct ci from DailyCheckIn ci
               left join fetch ci.observations
               where ci.child.id = :childId
               order by ci.checkInDate desc
               """)
        List<DailyCheckIn> findAllWithObservations(@Param("childId") UUID childId);
    }

    interface AreaRepo extends JpaRepository<DevelopmentArea, Short> {
        Optional<DevelopmentArea> findByCode(String code);
        List<DevelopmentArea> findAllByOrderBySortOrderAsc();
    }

    interface SkillRepo extends JpaRepository<DevelopmentSkill, UUID> {
        List<DevelopmentSkill> findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(short a, short b);
    }

    interface SkillObservationRepo extends JpaRepository<SkillObservation, UUID> {
        List<SkillObservation> findByChildIdOrderByObservedOnDesc(UUID childId);
        Optional<SkillObservation> findByChildIdAndSkillIdAndObservedOnAndSource(
                UUID childId, UUID skillId, LocalDate observedOn, ObservationSource source);
        List<SkillObservation> findByChildIdAndSkillIdOrderByObservedOnAsc(UUID childId, UUID skillId);
    }

    interface TeacherCodeRepo extends JpaRepository<TeacherAccessCode, UUID> {
        List<TeacherAccessCode> findByChildIdAndRevokedAtIsNull(UUID childId);
    }

    interface TeacherObsRepo extends JpaRepository<TeacherObservation, UUID> {
        List<TeacherObservation> findByChildIdOrderByObservedOnDesc(UUID childId);
    }

    interface ActivityRepo extends JpaRepository<Activity, UUID> {
        List<Activity> findByMinAgeMonthsLessThanEqualAndMaxAgeMonthsGreaterThanEqual(short a, short b);
    }

    interface MonthlyReportRepo extends JpaRepository<MonthlyReport, UUID> {
        List<MonthlyReport> findByChildIdOrderByPeriodStartDesc(UUID childId);
        Optional<MonthlyReport> findByChildIdAndPeriodStart(UUID childId, LocalDate periodStart);
    }

    interface ReadinessAreaRepo extends JpaRepository<ReadinessArea, Short> {
        List<ReadinessArea> findAllByOrderBySortOrderAsc();
    }

    interface ReadinessItemRepo extends JpaRepository<ReadinessItem, UUID> {
        List<ReadinessItem> findByAreaIdOrderBySortOrderAsc(Short areaId);
    }

    interface ReadinessRepo extends JpaRepository<SchoolReadinessAssessment, UUID> {
        List<SchoolReadinessAssessment> findByChildIdOrderByAssessedOnDesc(UUID childId);
    }
}
