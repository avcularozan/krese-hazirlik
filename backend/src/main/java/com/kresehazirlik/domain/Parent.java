package com.kresehazirlik.domain;
import jakarta.persistence.*;
import java.time.Instant; import java.util.*;

@Entity @Table(name="parent")
public class Parent {
    @Id @GeneratedValue private UUID id;
    @Column(nullable=false, unique=true) private String email;
    @Column(name="password_hash", nullable=false) private String passwordHash;
    @Column(name="display_name") private String displayName;
    private String locale = "tr-TR";
    @Column(name="consent_at") private Instant consentAt;
    @Column(name="created_at") private Instant createdAt = Instant.now();

    public UUID getId(){return id;} public void setId(UUID v){id=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
    public String getDisplayName(){return displayName;} public void setDisplayName(String v){displayName=v;}
    public String getLocale(){return locale;} public void setLocale(String v){locale=v;}
    public Instant getConsentAt(){return consentAt;} public void setConsentAt(Instant v){consentAt=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
}
