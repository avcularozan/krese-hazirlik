import { useEffect, useState } from "react";
import { api, ApiError, type Activity } from "../lib/api";
import { useChildren } from "../lib/ChildContext";
import { ChildSwitcher } from "../components/ChildSwitcher";
import { Icon } from "../components/Icon";
import { SkeletonCard } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";

export function Activities() {
  const { active, loading: childrenLoading } = useChildren();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(null);
    api.suggestedActivities(active.id)
      .then(setActivities)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Etkinlikler yüklenemedi"))
      .finally(() => setLoading(false));
  }, [active]);

  if (childrenLoading) return <div className="screen"><SkeletonCard /></div>;
  if (!active) return <div className="center-msg">Önce bir çocuk profili oluşturun.</div>;

  return (
    <>
      <div className="top-bar">
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Etkinlikler</h1>
        <ChildSwitcher />
      </div>
      <div className="screen">
        <p>{active.nickname} için yaşına uygun, önerilen etkinlikler.</p>
        {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && activities.length === 0 && (
          <EmptyState icon="dice" title="Henüz öneri yok" description="Birkaç gün check-in yaptıkça size özel etkinlikler burada belirecek." />
        )}

        {activities.map((a) => {
          const isOpen = open === a.code;
          return (
            <div key={a.code} className="card activity-card">
              <div className="activity-head" onClick={() => setOpen(isOpen ? null : a.code)}>
                <div className="activity-head-text">
                  <h2 style={{ marginBottom: 0 }}>{a.title}</h2>
                  <div className="activity-meta">
                    <span className="activity-tag">{a.areaCode}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="clock" size={14} />{a.durationMinutes} dk
                    </span>
                  </div>
                </div>
                <span className="chevron-btn" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
                  <Icon name="chevronDown" size={20} />
                </span>
              </div>
              {isOpen && (
                <div className="activity-body">
                  <h3>Amaç</h3>
                  <p style={{ marginBottom: 14 }}>{a.goal}</p>
                  {a.materials.length > 0 && (
                    <>
                      <h3>Malzeme</h3>
                      <p style={{ marginBottom: 14 }}>{a.materials.join(", ")}</p>
                    </>
                  )}
                  {a.steps.length > 0 && (
                    <>
                      <h3>Adımlar</h3>
                      <ol>
                        {a.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </>
                  )}
                  {a.parentTips.length > 0 && (
                    <div className="callout honey">
                      <Icon name="info" size={18} />
                      <p>{a.parentTips.join(" ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
