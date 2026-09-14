import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useChildren } from "../lib/ChildContext";
import { Icon } from "../components/Icon";
import { useToast } from "../lib/ToastContext";

const FOCUS_AREAS = [
  { code: "AYRILIK", label: "Ayrılık ve duygu düzenleme" },
  { code: "SOSYAL", label: "Akran ilişkileri" },
  { code: "DIL", label: "Dil ve iletişim" },
  { code: "OZBAKIM", label: "Öz bakım" },
  { code: "MOTOR", label: "Motor beceriler" },
  { code: "UYKU", label: "Uyku düzeni" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { setActiveId, refresh } = useChildren();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [usesRealName, setUsesRealName] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [groupName, setGroupName] = useState("");
  const [hadPreviousSchool, setHadPreviousSchool] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createChild(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const child = await api.createChild({ nickname, birthDate, usesRealName });
      setChildId(child.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Çocuk profili oluşturulamadı");
    } finally {
      setBusy(false);
    }
  }

  async function saveEnrollment(e: FormEvent) {
    e.preventDefault();
    if (!childId) return;
    setError(null);
    setBusy(true);
    try {
      await api.saveEnrollment(childId, {
        startDate,
        groupName: groupName || undefined,
        hadPreviousSchool: hadPreviousSchool || undefined,
        dailyHours: dailyHours || undefined,
        focusAreas,
      });
      await refresh();
      setActiveId(childId);
      toast.show("Hoş geldiniz! Uyum yolculuğu başladı.", "success");
      navigate("/today", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Okul bilgisi kaydedilemedi");
    } finally {
      setBusy(false);
    }
  }

  function toggleFocus(code: string) {
    setFocusAreas((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  if (step === 1) {
    return (
      <div className="screen" style={{ paddingTop: 24 }}>
        <div className="step-dots"><span className="done" /><span /></div>
        <span className="eyebrow">Adım 1 / 2</span>
        <h1>Çocuğunuzu tanıyalım</h1>
        <p>Fotoğraf istemiyoruz; takma ad kullanabilirsiniz. Amacımız kıyaslamak değil, zaman içindeki değişimi görmek.</p>
        <form onSubmit={createChild}>
          <label htmlFor="nickname">Takma ad</label>
          <input id="nickname" required autoFocus value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Örn. Minik Ayşe" />
          <label htmlFor="birthDate">Doğum tarihi</label>
          <input id="birthDate" type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <div className="checkbox-row">
            <input id="realName" type="checkbox" checked={usesRealName} onChange={(e) => setUsesRealName(e.target.checked)} />
            <label htmlFor="realName" style={{ margin: 0 }}>Bu gerçek adı</label>
          </div>
          {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Kaydediliyor…" : "Devam et"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 24 }}>
      <div className="step-dots"><span className="done" /><span className="done" /></div>
      <span className="eyebrow">Adım 2 / 2</span>
      <h1>Okul bilgileri</h1>
      <p>Bu bilgiler günlük check-in sorularını ve 30 günlük uyum yolculuğunu belirler.</p>
      <form onSubmit={saveEnrollment}>
        <label htmlFor="startDate">Okula başlama tarihi</label>
        <input id="startDate" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label htmlFor="groupName">Eğitim grubu</label>
        <input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Örn. Minik Kelebekler" />
        <label htmlFor="hadPrev">Önceki okul deneyimi</label>
        <select id="hadPrev" value={hadPreviousSchool} onChange={(e) => setHadPreviousSchool(e.target.value)}>
          <option value="">Seçiniz</option>
          <option value="YOK">İlk defa okula gidiyor</option>
          <option value="VAR">Daha önce okul/kreş deneyimi var</option>
        </select>
        <label htmlFor="hours">Günlük okul süresi</label>
        <select id="hours" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)}>
          <option value="">Seçiniz</option>
          <option value="YARIM_GUN">Yarım gün</option>
          <option value="TAM_GUN">Tam gün</option>
        </select>
        <label>Takip etmek istediğiniz alanlar (opsiyonel)</label>
        <div className="option-row" style={{ marginBottom: 16 }}>
          {FOCUS_AREAS.map((a) => (
            <button
              type="button"
              key={a.code}
              className={`option-chip ${focusAreas.includes(a.code) ? "selected" : ""}`}
              onClick={() => toggleFocus(a.code)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Kaydediliyor…" : "Başla"}</button>
      </form>
    </div>
  );
}
