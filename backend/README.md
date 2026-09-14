# Kreşe Hazırlık — Backend (Spring Boot)

2–7 yaş çocukların kreşe uyumunu ve gelişimini izleyen uygulamanın REST API'si.
Mobil uygulama tarafından da kullanılabilecek şekilde modüler ve stateless tasarlandı.

## Çalıştırma

```bash
docker run -d --name kres-db -e POSTGRES_DB=kresehazirlik -e POSTGRES_USER=kres \
  -e POSTGRES_PASSWORD=kres -p 5432:5432 postgres:16

export JWT_SECRET="en-az-32-karakterlik-gizli-bir-anahtar-yazin"
mvn spring-boot:run
```

Flyway `V1__init.sql` şemayı ve gelişim alanlarını otomatik oluşturur.
Beceri ve etkinlik içerikleri (`development_skill`, `activity`) `V2` migration'ı ile eklenir —
demo uygulamasındaki katalog referans alınabilir.

> Bu ortamda Maven Central'a erişim kapalı olduğu için derleme burada çalıştırılmadı;
> kendi makinenizde `mvn -DskipTests package` ile derleyin.

## Güvenlik modeli

| Aktör | Kimlik | Yetki |
|---|---|---|
| Ebeveyn | JWT (access 15 dk / refresh 30 gün) | Yalnızca kendi çocukları. Her uç `ChildAccessService.requireOwned` üzerinden geçer. |
| Öğretmen | `X-Access-Code` + `codeId` | Yalnızca gözlem **yazma**. Geçmiş kayıtları, raporları, ebeveyn verisini okuyamaz. Kod 30 gün geçerli, kullanım sayısı sınırlı, iptal edilebilir; veritabanında bcrypt hash olarak tutulur. |

Şifreler bcrypt (cost 12). Çocuk verisi hiçbir çapraz kullanıcı sorgusunda kullanılmaz.

## Ürün kurallarının koddaki karşılığı

- **Tanı yok, kıyas yok:** hiçbir sorgu başka çocukların verisini toplamaz; şemada persentil/sıralama alanı yoktur.
- **Tek gözlemden alarm yok:** `TrendService` bir cümle için ≥3 kayıt, "desteklenebilecek alan" için ≥5 kayıt ister.
- **Ölçülü yönlendirme:** `TrendService.referralHint` yalnızca ≥3 alanda süregelen zorlanmada, uzman görüşü **önerir**, tanı koymaz.
- **Ebeveyn ≠ öğretmen:** `ObservationSource` ile iki seri ayrı tutulur, `parentVsTeacher` yan yana döndürür.
- **Kısa günlük kayıt:** `CheckInQuestionService.pick` günde en fazla 4–5 madde seçer; son 3 gün sorulanı ve stabil iyi gideni eler.
- **NA ortalamaya girmez:** `SkillLevel.NA.value() == null`, `Observation.value == null` atlanır.
- **Veri hakları:** `GET /children/{id}/export`, `DELETE /me` (cascade ile tüm çocuk verisi).

## Uçlar

Tam liste için `TASARIM.md` bölüm 6.
