package com.kresehazirlik.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
import java.time.*; import java.util.*;

@Entity @Table(name="teacher_observation")
public class TeacherObservation {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="access_code_id") private TeacherAccessCode accessCode;
    @Column(name="teacher_alias") private String teacherAlias;
    @Column(name="observed_on", nullable=false) private LocalDate observedOn;
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable=false, columnDefinition="jsonb") private Map<String,Object> payload = new HashMap<>();
    @Column(name="created_at") private Instant createdAt = Instant.now();

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public TeacherAccessCode getAccessCode(){return accessCode;} public void setAccessCode(TeacherAccessCode v){accessCode=v;}
    public String getTeacherAlias(){return teacherAlias;} public void setTeacherAlias(String v){teacherAlias=v;}
    public LocalDate getObservedOn(){return observedOn;} public void setObservedOn(LocalDate v){observedOn=v;}
    public Map<String,Object> getPayload(){return payload;} public void setPayload(Map<String,Object> v){payload=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
}
