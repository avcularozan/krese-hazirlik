-- V3: okul olgunluğu (ilkokula hazırlık) katalog tabloları

create table readiness_area (
  id smallint primary key,
  code varchar(24) not null unique,
  name_tr varchar(120) not null,
  sort_order smallint not null
);

create table readiness_item (
  id uuid primary key default gen_random_uuid(),
  area_id smallint not null references readiness_area(id),
  code varchar(32) not null unique,
  text_tr varchar(240) not null,
  sort_order smallint not null
);

insert into readiness_area(id, code, name_tr, sort_order) values
  (1, 'dikkat', 'Dikkat', 1),
  (2, 'yonerge', 'Yönerge takibi', 2),
  (3, 'dil', 'Dil ve anlatım', 3),
  (4, 'ince', 'İnce motor', 4),
  (5, 'gorsel', 'Görsel algı', 5),
  (6, 'sayi', 'Temel sayı ve kavram', 6),
  (7, 'sosyal', 'Sosyal beceriler', 7),
  (8, 'duygu', 'Duygusal düzenleme', 8),
  (9, 'ozbakim', 'Öz bakım', 9),
  (10, 'sorumluluk', 'Sorumluluk', 10),
  (11, 'grup', 'Grup içinde hareket', 11);

insert into readiness_item(area_id, code, text_tr, sort_order) values
  (1, 'dikkat.0', 'Bir masa çalışmasında 10-15 dakika kalıyor', 1),
  (1, 'dikkat.1', 'Dikkati dağıldığında işe geri dönebiliyor', 2),
  (1, 'dikkat.2', 'Başladığı işi bitiriyor', 3),
  (2, 'yonerge.0', 'Üç adımlı yönergeyi tek seferde uyguluyor', 1),
  (2, 'yonerge.1', 'Sınıfa verilen toplu yönergeyi üzerine alıyor', 2),
  (2, 'yonerge.2', 'Yönergeyi anlamadığında soru soruyor', 3),
  (3, 'dil.0', 'Yaşadığı bir olayı sırasıyla anlatıyor', 1),
  (3, 'dil.1', 'Sorulara tam cümlelerle cevap veriyor', 2),
  (3, 'dil.2', 'Konuşması herkes tarafından anlaşılıyor', 3),
  (4, 'ince.0', 'Kalemi üç parmakla tutuyor', 1),
  (4, 'ince.1', 'Makasla çizgi üzerinde kesiyor', 2),
  (4, 'ince.2', 'Adını yazmaya çalışıyor', 3),
  (5, 'gorsel.0', 'Benzer şekilleri ayırt ediyor', 1),
  (5, 'gorsel.1', 'Basit bir şekli kopyalıyor', 2),
  (5, 'gorsel.2', 'Bir sayfadaki aynı simgeleri bulup işaretliyor', 3),
  (6, 'sayi.0', '1-10 sayıp nesne sayısıyla eşleştiriyor', 1),
  (6, 'sayi.1', 'Az-çok, büyük-küçük karşılaştırması yapıyor', 2),
  (6, 'sayi.2', 'Temel şekilleri ve renkleri adlandırıyor', 3),
  (7, 'sosyal.0', 'Arkadaşıyla anlaşmazlığı konuşarak çözmeye çalışıyor', 1),
  (7, 'sosyal.1', 'Gruba katılmak için uygun bir yol deniyor', 2),
  (7, 'sosyal.2', 'Yetişkinden uygun biçimde yardım istiyor', 3),
  (8, 'duygu.0', 'Hayal kırıklığında kısa sürede toparlanıyor', 1),
  (8, 'duygu.1', 'Öfkelendiğinde sakinleşme yolu deniyor', 2),
  (8, 'duygu.2', 'Beklemesi gerektiğinde kendini oyalayabiliyor', 3),
  (9, 'ozbakim.0', 'Tuvaletini bağımsız yapıyor', 1),
  (9, 'ozbakim.1', 'Kıyafetini kendi giyip çıkarıyor', 2),
  (9, 'ozbakim.2', 'Yemeğini bağımsız yiyor', 3),
  (10, 'sorumluluk.0', 'Eşyalarını tanıyor ve topluyor', 1),
  (10, 'sorumluluk.1', 'Kendi çantasını hazırlıyor', 2),
  (10, 'sorumluluk.2', 'Verilen küçük görevi hatırlayıp yapıyor', 3),
  (11, 'grup.0', 'Sırasını bekliyor', 1),
  (11, 'grup.1', 'Grupla birlikte yer değiştiriyor', 2),
  (11, 'grup.2', 'Toplu etkinlikte kendi yerini koruyor', 3);
