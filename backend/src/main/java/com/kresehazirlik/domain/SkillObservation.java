package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.time.LocalDate; import java.util.UUID;

@Entity @Table(name="skill_observation")
public class SkillObservation {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="skill_id") private DevelopmentSkill skill;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private SkillLevel level;
    @Column(name="observed_on", nullable=false) private LocalDate observedOn;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ObservationSource source = ObservationSource.PARENT;
    private String note;

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public DevelopmentSkill getSkill(){return skill;} public void setSkill(DevelopmentSkill v){skill=v;}
    public SkillLevel getLevel(){return level;} public void setLevel(SkillLevel v){level=v;}
    public LocalDate getObservedOn(){return observedOn;} public void setObservedOn(LocalDate v){observedOn=v;}
    public ObservationSource getSource(){return source;} public void setSource(ObservationSource v){source=v;}
    public String getNote(){return note;} public void setNote(String v){note=v;}
}
