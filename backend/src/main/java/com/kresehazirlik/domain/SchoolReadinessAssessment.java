package com.kresehazirlik.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
import java.time.LocalDate; import java.util.*;

@Entity @Table(name="school_readiness_assessment")
public class SchoolReadinessAssessment {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @Column(name="assessed_on", nullable=false) private LocalDate assessedOn;
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable=false, columnDefinition="jsonb") private Map<String,Object> payload = new HashMap<>();

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public LocalDate getAssessedOn(){return assessedOn;} public void setAssessedOn(LocalDate v){assessedOn=v;}
    public Map<String,Object> getPayload(){return payload;} public void setPayload(Map<String,Object> v){payload=v;}
}
