import { useEffect, useState } from "react";
import { api, ApiError, type ItemValue, type Mood, type TodayForm } from "../lib/api";
import { useChildren } from "../lib/ChildContext";
import { ChildSwitcher } from "../components/ChildSwitcher";
import { Icon } from "../components/Icon";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../lib/ToastContext";

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 4, emoji: "😊", label: "Rahat" },
  { value: 3, emoji: "🙂", label: "İyiydi" },
  { value: 2, emoji: "😐", label: "Zorlandı" },
  { value: 1, emoji: "😢", label: "Zor gündü" },
];

const ITEM_VALUES: { value: ItemValue; label: string; muted?: boolean }[] = [
  { value: 3, label: "Kolay" },
  { value: 2, label: "Biraz zorlandı" },
  { value: 1, label: "Zorlandı" },
  { value: 0, label: "Çok zorlandı" },
  { value: null, label: "Gözlemleyemedim", muted: true },
];

const PHASE_LABELS: Record<number, string> = {
  1: "Ayrılık ve ilk temas",
  2: "Öğretmen ve sınıf rutini",
  3: "Aidiyet ve güven",
  4: "Bağımsızlık ve grup",
};

export function Today() {
  const { active, loading: childrenLoading } = useChildren();
  const toast = useToast();
  const [form, setForm] = useState<TodayForm | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [items, setItems] = useState<Record<string, ItemValue>>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(null);
    api.todayForm(active.id)
      .then((data) => {
        setForm(data);
        if (data.existing) {
          setMood((data.existing.overallMood as Mood) ?? null);
          setItems(data.existing.items ?? {});
          setNote(data.existing.note ?? "");
        } else {
          setMood(null);
          setItems({});
          setNote("");
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Bugünün formu yüklenemedi"))
      .finally(() => setLoading(false));
  }, [active]);

  async function save() {
    if (!active || !form) return;
    setSaving(true);
    setError(null);
    try {
      await api.saveCheckIn(active.id, {
        date: form.date,
        overallMood: mood ?? undefined,
        items,
        note: note || undefined,
      });
      toast.show("Bugünün kaydı tutuldu.", "success");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Kaydedilemedi";
      setError(message);
      toast.show(message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (childrenLoading) {
    return (
      <div className="screen">
        <SkeletonCard />
      </div>
    );
  }
  if (!active) return <div className="center-msg">Önce bir çocuk profili oluşturun.</div>;

  return (
    <>
      <div className="top-bar">
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Bugün</h1>
        <ChildSwitcher />
      </div>
      <div className="screen">
        {loading && <SkeletonCard />}
        {error && !loading && <p className="error-text"><Icon name="info" size={16} />{error}</p>}

        {!loading && form && (
          <>
            <div className="hero-card">
              <div className="hero-badge">
                <Icon name="calendar" size={14} />
                {form.schoolDay}. okul günü
              </div>
              <h1 style={{ fontSize: "1.3rem" }}>Merhaba, {active.nickname}! 👋</h1>
              <p>
                {form.inAdaptationProgram
                  ? PHASE_LABELS[form.phase] ?? "Uyum yolculuğu sürüyor"
                  : "Günlük gözlemlerinizi kaydedin"}
              </p>
              {form.inAdaptationProgram && (
                <div className="hero-progress-track">
                  <div className="hero-progress-fill" style={{ width: `${Math.min(100, (form.schoolDay / 30) * 100)}%` }} />
                </div>
              )}
            </div>

            <div className="card">
              <h2>Bugün okul nasıl geçti?</h2>
              <div className="mood-row">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`mood-btn ${mood === m.value ? "selected" : ""}`}
                    onClick={() => setMood(m.value)}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>

              {form.questions.map((q) => (
                <div key={q.code} className="question-block">
                  <span className="question-text">{q.text}</span>
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
              <textarea id="note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bugün dikkatimi çeken bir şey…" />

              <button className="btn" onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor…" : <><Icon name="check" size={18} />Kaydet</>}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
