package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.time.Instant; import java.util.UUID;

@Entity @Table(name="teacher_access_code")
public class TeacherAccessCode {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="child_id") private Child child;
    @Column(name="code_hash", nullable=false) private String codeHash;
    @Column(name="created_at") private Instant createdAt = Instant.now();
    @Column(name="expires_at", nullable=false) private Instant expiresAt;
    @Column(name="revoked_at") private Instant revokedAt;
    @Column(name="max_uses") private short maxUses = 60;
    @Column(name="used_count") private short usedCount = 0;

    public boolean isUsable(){ return revokedAt == null && Instant.now().isBefore(expiresAt) && usedCount < maxUses; }

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public Child getChild(){return child;} public void setChild(Child v){child=v;}
    public String getCodeHash(){return codeHash;} public void setCodeHash(String v){codeHash=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
    public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){expiresAt=v;}
    public Instant getRevokedAt(){return revokedAt;} public void setRevokedAt(Instant v){revokedAt=v;}
    public short getMaxUses(){return maxUses;} public void setMaxUses(short v){maxUses=v;}
    public short getUsedCount(){return usedCount;} public void setUsedCount(short v){usedCount=v;}
}
