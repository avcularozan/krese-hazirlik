package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="observation")
public class Observation {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="check_in_id") private DailyCheckIn checkIn;
    @Column(name="item_code", nullable=false) private String itemCode;
    @Column(name="area_code", nullable=false) private String areaCode;
    /** null = "gözlemleme fırsatım olmadı" — ortalamaya girmez. */
    private Short value;

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public DailyCheckIn getCheckIn(){return checkIn;} public void setCheckIn(DailyCheckIn v){checkIn=v;}
    public String getItemCode(){return itemCode;} public void setItemCode(String v){itemCode=v;}
    public String getAreaCode(){return areaCode;} public void setAreaCode(String v){areaCode=v;}
    public Short getValue(){return value;} public void setValue(Short v){value=v;}
}
