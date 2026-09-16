-- Bir beceri için aynı gün içinde tek gözlem tutulur; tekrar işaretleme kaydı günceller.
-- Kısıt eklenmeden önce, tekillik uygulanmadığı dönemde oluşmuş yinelenen satırlar temizlenir
-- (aynı gün/aynı beceri için en son eklenen satır korunur).
delete from skill_observation a
 using skill_observation b
 where a.ctid < b.ctid
   and a.child_id = b.child_id
   and a.skill_id = b.skill_id
   and a.observed_on = b.observed_on
   and a.source = b.source;

alter table skill_observation
  add constraint skill_observation_child_skill_day_key
  unique (child_id, skill_id, observed_on, source);
