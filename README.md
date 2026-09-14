# Kreşe Hazırlık

2–7 yaş çocukların kreşe/anaokuluna uyumunu ve gelişimini izleyen Türkçe, mobil öncelikli uygulama.
Amaç çocukları karşılaştırmak veya tanı koymak değil; **ebeveynin kendi çocuğundaki değişimi zaman içinde görmesi**.

```
TASARIM.md      ürün ilkeleri, bilgi mimarisi, ekran akışları, ölçekler, DB şeması, REST uçları
app.html        çalışan demo (tek dosya, veriler yalnızca tarayıcıda)
backend/        Spring Boot 3 + PostgreSQL REST API
frontend/       Next.js için TypeScript API istemcisi
docker-compose.yml
```

## Hızlı başlangıç

```bash
cp .env.example .env && openssl rand -base64 48    # JWT_SECRET'i .env'e yazın
docker compose up --build
# API: http://localhost:8080/api/v1
```

Demo arayüzü için `app.html` dosyasını tarayıcıda açmanız yeterli — backend gerektirmez,
örnek bir çocuk (3 yaş, kreşe 29 gündür gidiyor) ile dolu gelir.

## Ürün ilkeleri

- Tanı koymaz, "geri kalmış" gibi ifadeler kullanmaz, çocukları sıralamaz.
- Tek gözlemden alarm üretmez: bir örüntü cümlesi için en az 3, "desteklenebilecek alan" için
  en az 5 kayıt ve 14 günlük yayılım gerekir.
- Yönlendirme ölçülüdür ve yalnızca 3+ alanda 3 haftadır süren örüntüde çıkar.
- Ebeveyn ve öğretmen gözlemleri ayrı seriler olarak tutulur, yan yana gösterilir.
- Günlük kayıt 1–2 dakikada biter; her gün aynı uzun form gösterilmez.
- Privacy-by-design: minimum veri, fotoğraf yok, takma ad, dışa aktarma ve geri dönüşsüz silme.
