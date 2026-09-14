package com.kresehazirlik;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackageClasses = com.kresehazirlik.repo.Repos.class, considerNestedRepositories = true)
public class KreseHazirlikApplication {
    public static void main(String[] args) { SpringApplication.run(KreseHazirlikApplication.class, args); }
}
