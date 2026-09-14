package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.time.*; import java.time.temporal.ChronoUnit; import java.util.UUID;

@Entity @Table(name="child")
public class Child {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="parent_id") private Parent parent;
    @Column(nullable=false) private String nickname;
    @Column(name="birth_date", nullable=false) private LocalDate birthDate;
    @Column(name="uses_real_name") private boolean usesRealName = false;
    @Column(name="created_at") private Instant createdAt = Instant.now();

    /** Yaşı yıl+ay olarak döndürür; hiçbir yerde başka çocuklarla karşılaştırma amacıyla kullanılmaz. */
    @Transient public int ageMonths() { return (int) ChronoUnit.MONTHS.between(birthDate, LocalDate.now()); }

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Parent getParent(){return parent;} public void setParent(Parent v){parent=v;}
    public String getNickname(){return nickname;} public void setNickname(String v){nickname=v;}
    public LocalDate getBirthDate(){return birthDate;} public void setBirthDate(LocalDate v){birthDate=v;}
    public boolean isUsesRealName(){return usesRealName;} public void setUsesRealName(boolean v){usesRealName=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
}
