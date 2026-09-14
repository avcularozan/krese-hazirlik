package com.kresehazirlik.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity @Table(name="activity")
public class Activity {
    @Id @GeneratedValue private UUID id;
    @Column(nullable=false, unique=true) private String code;
    @Column(name="title_tr", nullable=false) private String titleTr;
    @Column(name="area_code", nullable=false) private String areaCode;
    @Column(name="min_age_months", nullable=false) private Short minAgeMonths;
    @Column(name="max_age_months", nullable=false) private Short maxAgeMonths;
    @Column(name="goal_tr", nullable=false) private String goalTr;
    @JdbcTypeCode(SqlTypes.ARRAY) @Column(name="materials_tr", columnDefinition="text[]") private String[] materialsTr = new String[0];
    @Column(name="duration_minutes", nullable=false) private Short durationMinutes;
    @JdbcTypeCode(SqlTypes.ARRAY) @Column(name="steps_tr", columnDefinition="text[]") private String[] stepsTr = new String[0];
    @JdbcTypeCode(SqlTypes.ARRAY) @Column(name="parent_tips_tr", columnDefinition="text[]") private String[] parentTipsTr = new String[0];

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getTitleTr(){return titleTr;} public void setTitleTr(String v){titleTr=v;}
    public String getAreaCode(){return areaCode;} public void setAreaCode(String v){areaCode=v;}
    public Short getMinAgeMonths(){return minAgeMonths;} public void setMinAgeMonths(Short v){minAgeMonths=v;}
    public Short getMaxAgeMonths(){return maxAgeMonths;} public void setMaxAgeMonths(Short v){maxAgeMonths=v;}
    public String getGoalTr(){return goalTr;} public void setGoalTr(String v){goalTr=v;}
    public String[] getMaterialsTr(){return materialsTr;} public void setMaterialsTr(String[] v){materialsTr=v;}
    public Short getDurationMinutes(){return durationMinutes;} public void setDurationMinutes(Short v){durationMinutes=v;}
    public String[] getStepsTr(){return stepsTr;} public void setStepsTr(String[] v){stepsTr=v;}
    public String[] getParentTipsTr(){return parentTipsTr;} public void setParentTipsTr(String[] v){parentTipsTr=v;}
}
