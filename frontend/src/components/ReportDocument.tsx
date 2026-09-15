import type { AreaScore } from "../lib/api";
import { Icon } from "./Icon";

export interface MonthlyReportPayload {
  strong: AreaScore[];
  emerging: AreaScore[];
  supportable: AreaScore[];
  findings: { kind: string; text: string }[];
  goals: string[];
  disclaimer: string;
}

const KIND_LABEL: Record<string, string> = {
  UP: "Belirgin kolaylaşma",
  WATCH: "Gözlemlenmesi iyi olur",
  SUPPORT: "Destek önerisi",
  DOWN: "Zorlanma görülüyor",
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function names(items: AreaScore[], areaNames: Record<string, string>) {
  return items.map((i) => areaNames[i.areaCode] ?? i.areaCode);
}

export function ReportDocument({
  childName,
  periodStart,
  periodEnd,
  payload,
  areaNames,
}: {
  childName: string;
  periodStart: string;
  periodEnd: string;
  payload: MonthlyReportPayload;
  areaNames: Record<string, string>;
}) {
  const strongNames = names(payload.strong, areaNames);
  const emergingNames = names(payload.emerging, areaNames);
  const supportableNames = names(payload.supportable, areaNames);
  const hasAny = strongNames.length + emergingNames.length + supportableNames.length > 0;

  return (
    <div className="report-doc">
      <span className="report-doc-title">Aylık Gelişim Raporu</span>
      <h1>{childName}</h1>
      <p className="period">{fmt(periodStart)} – {fmt(periodEnd)}</p>

      <p className="intro">
        {hasAny
          ? `Bu dönemde ${childName} için kaydettiğiniz günlük gözlemlere dayanan bir özet hazırladık. Bu bir değerlendirme veya tanı değildir — yalnızca kendi kayıtlarınızın zaman içindeki görünümüdür.`
          : `Bu dönem için henüz belirgin bir örüntü oluşturacak kadar kayıt bulunmuyor. Günlük check-in'i sürdürdükçe raporlar daha anlamlı hale gelecek.`}
      </p>

      {strongNames.length > 0 && (
        <section>
          <h2><span className="bucket-tag bucket-strong">Güçlü gelişim</span></h2>
          <div className="area-chip-row">
            {strongNames.map((n) => <span key={n} className="area-chip">{n}</span>)}
          </div>
        </section>
      )}

      {emergingNames.length > 0 && (
        <section>
          <h2><span className="bucket-tag bucket-emerging">Gelişmekte olan</span></h2>
          <div className="area-chip-row">
            {emergingNames.map((n) => <span key={n} className="area-chip">{n}</span>)}
          </div>
        </section>
      )}

      {supportableNames.length > 0 && (
        <section>
          <h2><span className="bucket-tag bucket-supportable">Desteklenebilecek</span></h2>
          <div className="area-chip-row">
            {supportableNames.map((n) => <span key={n} className="area-chip">{n}</span>)}
          </div>
        </section>
      )}

      {payload.findings?.length > 0 && (
        <section>
          <h2>Gözlemler</h2>
          <div style={{ marginTop: 10 }}>
            {payload.findings.map((f, i) => (
              <div key={i} className="finding-line">
                <span className="finding-dot" />
                <p style={{ margin: 0, color: "var(--text)" }}>
                  <strong style={{ color: "var(--text-muted)", fontWeight: 700 }}>{KIND_LABEL[f.kind] ?? f.kind}:</strong> {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {payload.goals?.length > 0 && (
        <section>
          <h2><Icon name="sparkle" size={16} />Gelecek ay için hedefler</h2>
          <div className="goal-box">
            <p style={{ margin: 0 }}>Bu alanlarda küçük, oyun temelli adımlar önerilir:</p>
            <ol>
              {payload.goals.map((g) => <li key={g}>{areaNames[g] ?? g}</li>)}
            </ol>
          </div>
        </section>
      )}

      <p className="disclaimer">{payload.disclaimer || "Bu rapor bir değerlendirme veya tanı değildir; yalnızca kendi kayıtlarınızın özetidir."}</p>
    </div>
  );
}
