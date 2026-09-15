import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { ApiError, teacherApi, type ItemValue, type TeacherSession } from "../lib/api";
import { Icon } from "../components/Icon";

const ITEMS: { code: string; label: string }[] = [
  { code: "ayrilik", label: "Ayrılık anındaki tepkisi" },
  { code: "oyun", label: "Oyuna katılımı" },
  { code: "akranilgi", label: "Akranlarına ilgisi" },
  { code: "yonerge", label: "Yönerge takibi" },
  { code: "rutin", label: "Sınıf rutinlerine katılımı" },
];

const ITEM_VALUES: { value: ItemValue; label: string; muted?: boolean }[] = [
  { value: 3, label: "Kolay" },
  { value: 2, label: "Biraz zorlandı" },
  { value: 1, label: "Zorlandı" },
  { value: 0, label: "Çok zorlandı" },
  { value: null, label: "Gözlemleyemedim", muted: true },
];

export function TeacherForm() {
  const { codeId } = useParams<{ codeId: string }>();
  const [code, setCode] = useState("");
  const [session, setSession] = useState<TeacherSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [teacherAlias, setTeacherAlias] = useState("");
  const [items, setItems] = useState<Record<string, ItemValue>>({});
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    if (!codeId) return;
    setError(null);
    setBusy(true);
    try {
      const s = await teacherApi.session(codeId, code);
      setSession(s);
    } catch (err) {
      setError(err instanceof ApiError ? "Kod hatalı veya bağlantının süresi dolmuş." : "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!codeId) return;
    setError(null);
    setBusy(true);
    try {
      await teacherApi.submit(codeId, code, { teacherAlias: teacherAlias || undefined, items, note: note || undefined });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gönderilemedi");
    } finally {
      setBusy(false);
    }
  }

  if (!codeId) return <div className="center-msg">Geçersiz bağlantı.</div>;

  if (submitted) {
    return (
      <div className="auth-screen">
        <div className="empty-state">
          <div className="empty-state-icon"><Icon name="check" size={28} /></div>
          <h2>Teşekkürler!</h2>
          <p>Gözleminiz kaydedildi. Bu sayfayı kapatabilirsiniz.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-screen">
        <div className="auth-brand">
          <div className="auth-brand-mark">🍎</div>
          <div>
            <h1 style={{ marginBottom: 0 }}>Öğretmen Gözlemi</h1>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>Hesap açmanıza gerek yok</p>
          </div>
        </div>
        <form onSubmit={verifyCode}>
          <label htmlFor="code">Ebeveynden aldığınız 6 haneli kod</label>
          <input id="code" required inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Kontrol ediliyor…" : "Devam et"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 24 }}>
      <h1>{session.childNickname} için gözlem</h1>
      <p>Bu form 1 dakikanızı alır. Kayıtlar ebeveyninkinden ayrı tutulur, geçmiş kayıtları göremezsiniz.</p>
      <form onSubmit={submit}>
        <div className="card">
          <label htmlFor="alias">Adınız (opsiyonel, ebeveyne görünür)</label>
          <input id="alias" value={teacherAlias} onChange={(e) => setTeacherAlias(e.target.value)} placeholder="Öğretmen" />

          {ITEMS.map((q) => (
            <div key={q.code} className="question-block">
              <span className="question-text">{q.label}</span>
              <div className="option-row">
                {ITEM_VALUES.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    className={`option-chip ${items[q.code] === opt.value ? "selected" : ""} ${opt.muted ? "muted" : ""}`}
                    onClick={() => setItems((prev) => ({ ...prev, [q.code]: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <label htmlFor="note" style={{ marginTop: 4 }}>Not (opsiyonel)</label>
          <textarea id="note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />

          {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Gönderiliyor…" : <><Icon name="check" size={18} />Gönder</>}
          </button>
        </div>
      </form>
    </div>
  );
}
