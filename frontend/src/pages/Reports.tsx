import { useEffect, useState } from "react";
import { api, ApiError, type AreaScore, type Trends } from "../lib/api";
import { useChildren } from "../lib/ChildContext";
import { ChildSwitcher } from "../components/ChildSwitcher";
import { Icon } from "../components/Icon";
import { SkeletonCard } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { useToast } from "../lib/ToastContext";

function AreaList({ title, items, tone }: { title: string; items: AreaScore[]; tone: "strong" | "emerging" | "supportable" }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <span className={`bucket-tag bucket-${tone}`}>{title}</span>
      <p style={{ marginTop: 2, marginBottom: 14 }}>{items.map((i) => i.areaCode).join(", ")}</p>
    </div>
  );
}

interface MonthlyReportPayload {
  strong: AreaScore[];
  emerging: AreaScore[];
  supportable: AreaScore[];
  findings: { kind: string; text: string }[];
  goals: string[];
  disclaimer: string;
}
interface MonthlyReportRow { periodStart: string; periodEnd: string; payload: MonthlyReportPayload }

export function Reports() {
  const { active, loading: childrenLoading } = useChildren();
  const toast = useToast();
  const [windowDays, setWindowDays] = useState<7 | 30 | 90>(7);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [reports, setReports] = useState<MonthlyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openReport, setOpenReport] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    Promise.all([api.trends(active.id, windowDays), api.monthlyReports(active.id)])
      .then(([t, r]) => {
        setTrends(t);
        setReports(r as unknown as MonthlyReportRow[]);
      })
      .catch((err) => toast.show(err instanceof ApiError ? err.message : "Raporlar yüklenemedi", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, windowDays]);

  async function generateReport() {
    if (!active) return;
    setGenerating(true);
    try {
      await api.generateMonthlyReport(active.id);
      const r = await api.monthlyReports(active.id);
      setReports(r as unknown as MonthlyReportRow[]);
      setOpenReport(0);
      toast.show("Aylık rapor oluşturuldu.", "success");
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Rapor oluşturulamadı", "error");
    } finally {
      setGenerating(false);
    }
  }

  if (childrenLoading) return <div className="screen"><SkeletonCard /></div>;
  if (!active) return <div className="center-msg">Önce bir çocuk profili oluşturun.</div>;

  const hasFindings = trends && (
    trends.findings.length > 0 || trends.buckets.strong.length > 0 ||
    trends.buckets.emerging.length > 0 || trends.buckets.supportable.length > 0
  );

  return (
    <>
      <div className="top-bar">
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Raporlar</h1>
        <ChildSwitcher />
      </div>
      <div className="screen">
        <div className="tabs">
          {[7, 30, 90].map((w) => (
            <button key={w} className={`tab-btn ${windowDays === w ? "active" : ""}`} onClick={() => setWindowDays(w as 7 | 30 | 90)}>
              {w} gün
            </button>
          ))}
        </div>

        {loading && <SkeletonCard />}

        {!loading && trends && (
          <div className="card">
            <h2>Eğilim özeti</h2>
            {!hasFindings ? (
              <p style={{ margin: 0 }}>Henüz örüntü oluşturacak kadar kayıt yok. Günlük check-in'i sürdürdükçe burası dolacak.</p>
            ) : (
              <>
                <AreaList title="Güçlü gelişim" items={trends.buckets.strong} tone="strong" />
                <AreaList title="Gelişmekte olan" items={trends.buckets.emerging} tone="emerging" />
                <AreaList title="Desteklenebilecek" items={trends.buckets.supportable} tone="supportable" />
                {trends.findings.map((f, i) => <p key={i} style={{ marginBottom: 6 }}>• {f.text}</p>)}
              </>
            )}
            {trends.referralHint && (
              <div className="callout honey" style={{ marginTop: 10 }}>
                <Icon name="info" size={18} />
                <p>{trends.referralHint}</p>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2>Aylık rapor</h2>
          <p>30 günlük özet, güçlü yönler ve gelecek ay için en fazla 3 küçük hedef.</p>
          <button className="btn secondary" onClick={generateReport} disabled={generating} style={{ marginBottom: reports.length ? 14 : 0 }}>
            {generating ? "Oluşturuluyor…" : <><Icon name="sparkle" size={18} />Bu ayın raporunu oluştur</>}
          </button>
          {reports.length === 0 ? (
            !generating && <EmptyState icon="chart" title="Henüz rapor yok" description="Yukarıdaki butonla ilk aylık raporunuzu oluşturun." />
          ) : (
            reports.map((r, i) => {
              const isOpen = openReport === i;
              const p = r.payload;
              return (
                <div key={i} className="list-item" style={{ cursor: "pointer" }} onClick={() => setOpenReport(isOpen ? null : i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="calendar" size={18} />
                    <span style={{ color: "var(--text)", fontWeight: 600, flex: 1 }}>{r.periodStart} → {r.periodEnd}</span>
                    <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} />
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      {p.strong?.length === 0 && p.emerging?.length === 0 && p.supportable?.length === 0 && (
                        <p style={{ margin: 0 }}>Bu dönem için henüz belirgin bir örüntü yok.</p>
                      )}
                      <AreaList title="Güçlü gelişim" items={p.strong ?? []} tone="strong" />
                      <AreaList title="Gelişmekte olan" items={p.emerging ?? []} tone="emerging" />
                      <AreaList title="Desteklenebilecek" items={p.supportable ?? []} tone="supportable" />
                      {p.findings?.map((f, fi) => <p key={fi} style={{ marginBottom: 6 }}>• {f.text}</p>)}
                      {p.goals?.length > 0 && (
                        <>
                          <h3 style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginTop: 12, marginBottom: 6 }}>
                            Gelecek ay için hedefler
                          </h3>
                          <p style={{ margin: 0 }}>{p.goals.join(", ")}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
