package com.kresehazirlik.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
import java.time.*; import java.util.*;

@Entity @Table(name="monthly_report")
public class MonthlyReport {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @Column(name="period_start", nullable=false) private LocalDate periodStart;
    @Column(name="period_end", nullable=false) private LocalDate periodEnd;
    @Column(name="generated_at") private Instant generatedAt = Instant.now();
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable=false, columnDefinition="jsonb") private Map<String,Object> payload = new HashMap<>();

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public LocalDate getPeriodStart(){return periodStart;} public void setPeriodStart(LocalDate v){periodStart=v;}
    public LocalDate getPeriodEnd(){return periodEnd;} public void setPeriodEnd(LocalDate v){periodEnd=v;}
    public Instant getGeneratedAt(){return generatedAt;} public void setGeneratedAt(Instant v){generatedAt=v;}
    public Map<String,Object> getPayload(){return payload;} public void setPayload(Map<String,Object> v){payload=v;}
}
