package com.kresehazirlik.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
import java.time.LocalDate; import java.util.UUID;

@Entity @Table(name="school_enrollment")
public class SchoolEnrollment {
    @Id @GeneratedValue private UUID id;
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @Column(name="school_name") private String schoolName;
    @Column(name="start_date", nullable=false) private LocalDate startDate;
    @Column(name="group_name") private String groupName;
    @Column(name="had_previous_school") private String hadPreviousSchool;
    @Column(name="daily_hours") private String dailyHours;
    @JdbcTypeCode(SqlTypes.ARRAY) @Column(name="focus_areas", columnDefinition="text[]") private String[] focusAreas = new String[0];
    @Column(name="adaptation_started_on") private LocalDate adaptationStartedOn;

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public String getSchoolName(){return schoolName;} public void setSchoolName(String v){schoolName=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
    public String getGroupName(){return groupName;} public void setGroupName(String v){groupName=v;}
    public String getHadPreviousSchool(){return hadPreviousSchool;} public void setHadPreviousSchool(String v){hadPreviousSchool=v;}
    public String getDailyHours(){return dailyHours;} public void setDailyHours(String v){dailyHours=v;}
    public String[] getFocusAreas(){return focusAreas;} public void setFocusAreas(String[] v){focusAreas=v==null?new String[0]:v;}
    public LocalDate getAdaptationStartedOn(){return adaptationStartedOn;} public void setAdaptationStartedOn(LocalDate v){adaptationStartedOn=v;}
}
