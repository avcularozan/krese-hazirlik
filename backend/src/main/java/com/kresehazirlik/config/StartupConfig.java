package com.kresehazirlik.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.LazyInitializationExcludeFilter;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StartupConfig {

    /**
     * Tembel kurulum açıkken Flyway de ertelenir; bu durumda veritabanı göçleri açılışta değil,
     * ilk isteği karşılarken çalışır ve servis göç tamamlanmadan "hazır" görünür.
     * Göç bileşenleri bu yüzden kapsam dışında bırakılır.
     */
    @Bean
    LazyInitializationExcludeFilter eagerFlyway() {
        return LazyInitializationExcludeFilter.forBeanTypes(Flyway.class, FlywayMigrationInitializer.class);
    }
}
