import type { AreaScore } from "../lib/api";

export interface MonthlyReportPayload {
  strong: AreaScore[];
  emerging: AreaScore[];
  supportable: AreaScore[];
  findings: { kind: string; text: string }[];
  goals: string[];
  disclaimer: string;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function names(items: AreaScore[] | undefined, areaNames: Record<string, string>) {
  return (items ?? []).map((i) => areaNames[i.areaCode] ?? i.areaCode);
}

function Section({ no, title, children }: { no: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2><span className="section-no">{no}</span>{title}</h2>
      {children}
    </section>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "strong" | "emerging" | "supportable" }) {
  return (
    <div className="area-chip-row">
      {items.map((n) => <span key={n} className={`area-chip chip-${tone}`}>{n}</span>)}
    </div>
  );
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
  const strong = names(payload.strong, areaNames);
  const emerging = names(payload.emerging, areaNames);
  const supportable = names(payload.supportable, areaNames);
  const hasAny = strong.length + emerging.length + supportable.length > 0;

  const findings = payload.findings ?? [];
  const positives = findings.filter((f) => f.kind === "UP");
  const watching = findings.filter((f) => f.kind !== "UP");
  const goals = payload.goals ?? [];

  let no = 0;

  return (
    <div className="report-doc">
      <div className="report-brand">Kreşe Hazırlık</div>

      <span className="report-doc-title">Aylık Gelişim Raporu</span>
      <h1>{childName}</h1>
      <p className="period">{fmt(periodStart)} – {fmt(periodEnd)}</p>

      <p className="intro">
        {hasAny
          ? `Bu rapor, ${childName} için kaydettiğiniz günlük gözlemlerin son bir aylık özetidir. Başka çocuklarla kıyaslama içermez; yalnızca kendi kayıtlarınızdaki değişimi gösterir.`
          : `Bu dönemde bir örüntü oluşturacak kadar kayıt birikmemiş. Günlük check-in'i sürdürdükçe rapor anlamlı hale gelecek.`}
      </p>

      {hasAny && (
        <div className="stat-row">
          <div className="stat"><span className="stat-num stat-strong">{strong.length}</span><span className="stat-label">güçlü alan</span></div>
          <div className="stat"><span className="stat-num stat-emerging">{emerging.length}</span><span className="stat-label">gelişmekte</span></div>
          <div className="stat"><span className="stat-num stat-supportable">{supportable.length}</span><span className="stat-label">desteklenebilir</span></div>
        </div>
      )}

      {strong.length > 0 && (
        <Section no={++no} title="Güçlü gelişim alanları">
          <p className="section-hint">Bu alanlarda çoğu gün rahat ilerlemiş görünüyor.</p>
          <Chips items={strong} tone="strong" />
        </Section>
      )}

      {emerging.length > 0 && (
        <Section no={++no} title="Gelişmekte olan alanlar">
          <p className="section-hint">Bazı günler kolay, bazı günler biraz zorlanmış.</p>
          <Chips items={emerging} tone="emerging" />
        </Section>
      )}

      {supportable.length > 0 && (
        <Section no={++no} title="Desteklenebilecek alanlar">
          <p className="section-hint">Bu alanlarda küçük desteklerle fark yaratılabilir.</p>
          <Chips items={supportable} tone="supportable" />
        </Section>
      )}

      {positives.length > 0 && (
        <Section no={++no} title="Bu ay fark ettiğimiz güzel gelişmeler">
          {positives.map((f, i) => (
            <div key={i} className="finding-line">
              <span className="finding-dot dot-strong" />
              <p>{f.text}</p>
            </div>
          ))}
        </Section>
      )}

      {watching.length > 0 && (
        <Section no={++no} title="Gözlemlemekte yarar olan noktalar">
          {watching.map((f, i) => (
            <div key={i} className="finding-line">
              <span className="finding-dot dot-honey" />
              <p>{f.text}</p>
            </div>
          ))}
        </Section>
      )}

      {goals.length > 0 && (
        <Section no={++no} title="Gelecek ay için küçük hedefler">
          <div className="goal-box">
            <p style={{ margin: 0 }}>Bu alanlarda oyun temelli, küçük adımlar önerilir:</p>
            <ol>
              {goals.map((g) => <li key={g}>{areaNames[g] ?? g}</li>)}
            </ol>
          </div>
        </Section>
      )}

      <p className="disclaimer">
        {payload.disclaimer || "Bu rapor bir değerlendirme veya tanı değildir; yalnızca kendi kayıtlarınızın özetidir."}
      </p>
    </div>
  );
}
