package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="development_skill")
public class DevelopmentSkill {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="area_id") private DevelopmentArea area;
    @Column(nullable=false, unique=true) private String code;
    @Column(name="text_tr", nullable=false) private String textTr;
    @Column(name="min_age_months", nullable=false) private Short minAgeMonths;
    @Column(name="max_age_months", nullable=false) private Short maxAgeMonths;

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public DevelopmentArea getArea(){return area;} public void setArea(DevelopmentArea v){area=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getTextTr(){return textTr;} public void setTextTr(String v){textTr=v;}
    public Short getMinAgeMonths(){return minAgeMonths;} public void setMinAgeMonths(Short v){minAgeMonths=v;}
    public Short getMaxAgeMonths(){return maxAgeMonths;} public void setMaxAgeMonths(Short v){maxAgeMonths=v;}
}
