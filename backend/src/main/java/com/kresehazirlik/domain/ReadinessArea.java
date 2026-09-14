package com.kresehazirlik.domain;
import jakarta.persistence.*;

@Entity @Table(name="readiness_area")
public class ReadinessArea {
    @Id private Short id;
    @Column(nullable=false, unique=true) private String code;
    @Column(name="name_tr", nullable=false) private String nameTr;
    @Column(name="sort_order", nullable=false) private Short sortOrder;

    public Short getId(){return id;} public void setId(Short v){id=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getNameTr(){return nameTr;} public void setNameTr(String v){nameTr=v;}
    public Short getSortOrder(){return sortOrder;} public void setSortOrder(Short v){sortOrder=v;}
}
