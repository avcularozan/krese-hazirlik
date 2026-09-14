# Kreşe Hazırlık — Ürün ve Teknik Tasarım

> Amaç: Ebeveynin **kendi çocuğundaki değişimi** zaman içinde görmesi. Tanı yok, kıyas yok, sıralama yok.

## 1. Ürün ilkeleri (koda yansıyan kurallar)

| İlke | Teknik karşılığı |
|---|---|
| Tanı koyma | Metin şablonlarında "gecikme/geri/anormal/bozukluk" kelimeleri yasaklı; `SAFE_LANGUAGE_GUARD` sözlüğü |
| Kıyas yok | Hiçbir endpoint başka çocuğun verisini agregeye sokmaz; persentil alanı şemada yok |
| Tek gözlemden alarm yok | `TrendEngine` min. 5 kayıt + 14 gün pencere istemeden "dikkat" sinyali üretmez |
| Kaygı üretme | Bulgular 3 kovaya: `STRONG` / `EMERGING` / `SUPPORTABLE`. "Sorun" kovası yok |
| Örüntü temelli | Tüm değerlendirme 7 / 30 / 90 günlük pencereler üzerinde |
| Yönlendirme | `referralHint` yalnızca 21 gün+ süren, ≥3 alanı etkileyen örüntüde, ölçülü dille |
| Ebeveyn ≠ öğretmen | `Observation.source = PARENT | TEACHER`, raporlarda ayrı seriler |

## 2. Bilgi mimarisi

```
Kök
├─ Onboarding (ilk açılış)
├─ Bugün           → durum kartı, 1-2 dk check-in, aktif hedef, son olumlu gelişme, önerilen etkinlik
├─ Gelişim         → 9 alan · yaşa uygun beceri listesi · alan detayı & zaman çizgisi
│   └─ Okula Hazırlık (çocuk ≥ 5y0a ise aktifleşir)
├─ Etkinlikler     → alan/yaş filtresi · etkinlik detayı (amaç, malzeme, süre, uygulama, dikkat)
├─ Raporlar        → 7 günlük eğilim · 30 günlük özet · aylık rapor · öğretmen-ebeveyn karşılaştırma
└─ Profil          → çocuk profili, öğretmen bağlantı kodu, gizlilik, dışa aktar, sil
```

Alt navigasyon 5 sekme: **Bugün · Gelişim · Etkinlikler · Raporlar · Profil**

## 3. Kullanıcı akışları

### 3.1 Onboarding (tek seferlik, ~60 sn)
1. Ad/takma ad → 2. Doğum tarihi (yaş = yıl+ay otomatik) → 3. Okula başlama tarihi → 4. Eğitim grubu
→ 5. Önceki okul deneyimi → 6. Günlük okul süresi → 7. Takip etmek istenen alanlar (çoklu, atlanabilir)
→ Başlama tarihi ≤ 30 gün önce ise **30 Günlük Okula Uyum Yolculuğu** otomatik başlar.

### 3.2 Günlük check-in (hedef < 2 dk)
- **Q0 (her zaman):** "Bugün okul nasıl geçti?" → 😊 Rahat geçti / 🙂 Genel olarak iyiydi / 😐 Biraz zorlandı / 😢 Zor bir gündü
- **Dinamik soru seçimi:** `pickQuestions(dayIndex, age, lastAnswers)` → en fazla **4** soru
  - Gün 1–3: evden çıkma, ayrılık tepkisi, sakinleşme süresi, öğretmenden destek kabulü, oyuna katılım, yemek, uyku, eve dönüş duygu durumu
  - Gün 4–7: + öğretmenle ilişki, sınıf rutinleri, yönerge takibi, etkinliğe katılım, akran ilgisi
  - Hafta 2: aidiyet, öğretmene güven, sınıfa isteyerek giriş, etkinlik seçme, akran etkileşimi, duygusal düzenleme
  - Hafta 3: öz bakım, bağımsızlık, eşyalarını tanıma, sıra bekleme, geçişler, hayal kırıklığı toleransı
  - Gün 30+: haftalık rotasyon (her gün aynı uzun form gösterilmez)
  - **Kural:** son 3 gündür stabil "iyi" giden madde sorulmaz; dün zorlanılan madde öncelikli sorulur
- Serbest not (opsiyonel, tek satır) → Kaydet

### 3.3 Aylık rapor
30. günde otomatik üretilir: Güçlü gelişim · Gelişmekte olan · Desteklenebilecek · "Bu ay fark ettiğimiz güzel gelişme" · gelecek ay için **en fazla 3** küçük hedef.

### 3.4 Öğretmen gözlemi
Ebeveyn 6 haneli kod + bağlantı üretir → öğretmen hesap açmadan 5 soruluk kısa formu doldurur → kayıt `source=TEACHER`.
Rapor ekranında ebeveyn/öğretmen serileri yan yana; fark varsa nötr dille not düşülür.

## 3.5 İçerik kataloğu (v2)

| Katalog | Adet | Not |
|---|---|---|
| Gelişim alanı | 9 | her biri kısa açıklamayla |
| Günlük check-in maddesi | 31 | 4 evreye dağılmış, 6 tanesi kendi özel seçenek etiketleriyle |
| Yaşa uygun beceri maddesi | 81 | 24-84 ay arası, alan başına 6-11 madde |
| Etkinlik | 55 | amaç · malzeme · süre · adımlar · dikkat edilecekler |
| Uyum yolculuğu günlük ipucu | 30 | her gün için tek cümlelik, uygulanabilir öneri |
| Okul olgunluğu maddesi | 33 | 11 alan × 3 somut madde |

Uyum yolculuğu 4 evreye ayrılır; her evrenin başlığı, açıklaması ve o evrede açılan maddeleri vardır
(`PHASES`): 1-3. gün *Ayrılık ve ilk temas* · 4-7. gün *Öğretmen ve sınıf rutini* ·
2. hafta *Aidiyet ve güven* · 3-4. hafta *Bağımsızlık ve grup*.

## 3.6 Tasarım sistemi

- **Tipografi:** Baloo 2 (başlık, yumuşak/oyuncu) + Figtree (metin ve veri, `tabular-nums`).
- **Renk:** mürdüm ana vurgu, bal ve adaçayı durum renkleri; nötrler vurguya doğru hafifçe eğilimli.
  Açık ve koyu temanın tamamı token düzeyinde tanımlı (`:root`, `prefers-color-scheme`, `data-theme`).
- **Grafik serileri:** ebeveyn `#8433B5` / öğretmen `#0F7A57` (koyu tema `#A96FD8` / `#2FA87F`).
  Renk körlüğü ayrımı ΔE 17.5 (deuteranopi), normal görüş ΔE 29.2, zemin kontrastı >3:1 — doğrulayıcı ile ölçüldü.
  İki seri her zaman lejantla birlikte; seri rengi hiçbir zaman metne uygulanmaz.
- **Kodlama kuralı:** alanlar renkle değil metinle ayrılır; çubuklar *büyüklük* kodlar (tek hue),
  kova etiketleri (güçlü / gelişmekte / desteklenebilir) ayrı durum renkleriyle ve yazıyla verilir.
- **Etkileşim:** çizgi grafikte dokunma/imleç ile ipucu kutusu; eksik günlerde çizgi kesilir, "kayıt yok" yazar.

## 4. Değerlendirme ölçekleri

- **Günlük madde ölçeği (0–3):** `3 Kolay / 2 Biraz zorlandı / 1 Zorlandı / 0 Çok zorlandı` + `null = Gözlemleyemedim`
- **Beceri ölçeği:** `INDEPENDENT · WITH_REMINDER · WITH_HELP · NOT_YET · NO_CHANCE_TO_OBSERVE`
- `NO_CHANCE_TO_OBSERVE` hiçbir ortalamaya girmez.

### Trend kuralları
- Aynı cümle tekrarlanmaz: "desteklenebilecek" bulguları **alan bazında** toplanır, en fazla 2 alan gösterilir;
  ilerleme cümleleri en fazla 3, izleme cümleleri en fazla 2 ile sınırlıdır.
- 7 günlük ortalama vs önceki 7 gün; fark ≥ 0.5 → "belirgin ilerleme", ≤ −0.5 → "bu hafta daha zorlanmış görünüyor"
- 30 günlük: haftalık ortalamaların eğimi
- Bir alanın "desteklenebilecek" sayılması için: ≥ 5 kayıt **ve** ≥ 14 gün **ve** ortalama < 1.5
- Rozet/puan/sıralama yok.
- Grafik pencereleri: 7 ve 30 gün günlük değerlerle, 90 gün **haftalık ortalamalarla** çizilir.

## 5. Veri modeli (PostgreSQL)

```
parent(id, email, password_hash, display_name, created_at, consent_at, locale)
child(id, parent_id→parent, nickname, birth_date, uses_real_name, photo_url NULL, created_at)
school_enrollment(id, child_id→child, school_name NULL, start_date, group_name,
                  had_previous_school, daily_hours, focus_areas text[], adaptation_program_started_on)
daily_check_in(id, child_id, check_in_date, overall_mood(1..4), note, source(PARENT|TEACHER),
               created_at, UNIQUE(child_id, check_in_date, source))
observation(id, check_in_id→daily_check_in, item_code, value smallint NULL, area_id→development_area)
development_area(id, code, name_tr, description_tr, sort_order)
development_skill(id, area_id, code, text_tr, min_age_months, max_age_months)
skill_observation(id, child_id, skill_id, level, observed_on, source, note)
teacher_observation(id, child_id, access_code_id, teacher_alias, observed_on, payload jsonb, created_at)
teacher_access_code(id, child_id, code_hash, created_at, expires_at, revoked_at, max_uses, used_count)
activity(id, code, title_tr, area_id, min_age_months, max_age_months, goal_tr,
         materials_tr text[], duration_minutes, steps_tr text[], parent_tips_tr text[])
monthly_report(id, child_id, period_start, period_end, generated_at, payload jsonb)
school_readiness_assessment(id, child_id, assessed_on, payload jsonb)
```
İndeksler: `daily_check_in(child_id, check_in_date desc)`, `skill_observation(child_id, observed_on desc)`, `observation(check_in_id)`.

## 6. REST API

Auth: JWT (access 15 dk + refresh 30 gün). Her `/children/{childId}/**` isteğinde `ChildOwnershipGuard` → `child.parent_id = principal.id`.
Öğretmen uçları JWT istemez; `X-Access-Code` başlığı ile yalnızca **yazma** ve **kendi gönderdiğini okuma** yetkisi verir.

```
POST   /api/v1/auth/register            POST /api/v1/auth/login   POST /api/v1/auth/refresh
GET    /api/v1/me

POST   /api/v1/children                 GET  /api/v1/children
GET/PATCH/DELETE /api/v1/children/{id}
POST   /api/v1/children/{id}/enrollment     GET /api/v1/children/{id}/enrollment

GET    /api/v1/children/{id}/checkins?from&to
GET    /api/v1/children/{id}/checkins/today       → o güne özel dinamik soru seti
POST   /api/v1/children/{id}/checkins
PATCH  /api/v1/children/{id}/checkins/{date}

GET    /api/v1/children/{id}/adaptation/progress  → 30 günlük yolculuk durumu
GET    /api/v1/development/areas
GET    /api/v1/children/{id}/development/skills   → yaşa göre filtreli
POST   /api/v1/children/{id}/development/observations
GET    /api/v1/children/{id}/development/summary

GET    /api/v1/children/{id}/trends?window=7|30|90
GET    /api/v1/children/{id}/reports/monthly
POST   /api/v1/children/{id}/reports/monthly/generate
GET    /api/v1/children/{id}/readiness            (yaş ≥ 60 ay ise 200, değilse 409)
GET    /api/v1/children/{id}/readiness/catalog    → 11 alan · 33 madde
POST   /api/v1/children/{id}/readiness

GET    /api/v1/activities?areaCode&ageMonths
GET    /api/v1/children/{id}/activities/suggested

POST   /api/v1/children/{id}/teacher-codes        → {code, url, expiresAt}
DELETE /api/v1/children/{id}/teacher-codes/{codeId}
GET    /api/v1/teacher/session                    (X-Access-Code)
POST   /api/v1/teacher/observations               (X-Access-Code)
GET    /api/v1/children/{id}/comparison           → ebeveyn vs öğretmen

GET    /api/v1/children/{id}/export               → tüm veri JSON
DELETE /api/v1/me                                 → hesap + tüm çocuk verisi (hard delete)
```

## 7. Gizlilik
Zorunlu alan sayısı minimumda; fotoğraf yok; takma ad varsayılan; e-posta yalnızca kimlik; veriler yalnızca sahibinin;
dışa aktarma ve geri dönüşsüz silme kullanıcı elinde; öğretmen kodu süreli, kullanım sayısı sınırlı, iptal edilebilir.
Demo uygulamada tüm veri **yalnızca cihazın tarayıcısında** tutulur, hiçbir sunucuya gitmez.

## 8. MVP kapsamı
Kayıt/giriş · çocuk profili · okul bilgileri · 30 günlük uyum · günlük check-in · haftalık trend · aylık rapor · yaşa uygun etkinlikler · geçmiş kayıtlar.
