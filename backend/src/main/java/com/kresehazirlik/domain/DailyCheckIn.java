package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.time.*; import java.util.*;

@Entity @Table(name="daily_check_in")
public class DailyCheckIn {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @Column(name="check_in_date", nullable=false) private LocalDate checkInDate;
    @Column(name="overall_mood") private Short overallMood;
    private String note;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ObservationSource source = ObservationSource.PARENT;
    @Column(name="created_at") private Instant createdAt = Instant.now();
    @OneToMany(mappedBy="checkIn", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<Observation> observations = new ArrayList<>();

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public LocalDate getCheckInDate(){return checkInDate;} public void setCheckInDate(LocalDate v){checkInDate=v;}
    public Short getOverallMood(){return overallMood;} public void setOverallMood(Short v){overallMood=v;}
    public String getNote(){return note;} public void setNote(String v){note=v;}
    public ObservationSource getSource(){return source;} public void setSource(ObservationSource v){source=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
    public List<Observation> getObservations(){return observations;}
}
