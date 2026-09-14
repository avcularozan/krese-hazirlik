package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="readiness_item")
public class ReadinessItem {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="area_id") private ReadinessArea area;
    @Column(nullable=false, unique=true) private String code;
    @Column(name="text_tr", nullable=false) private String textTr;
    @Column(name="sort_order", nullable=false) private Short sortOrder;

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public ReadinessArea getArea(){return area;} public void setArea(ReadinessArea v){area=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getTextTr(){return textTr;} public void setTextTr(String v){textTr=v;}
    public Short getSortOrder(){return sortOrder;} public void setSortOrder(Short v){sortOrder=v;}
}
