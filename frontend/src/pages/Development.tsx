import { useEffect, useState } from "react";
import { api, ApiError, type DevelopmentArea, type Skill, type SkillLevel } from "../lib/api";
import { useChildren } from "../lib/ChildContext";
import { ChildSwitcher } from "../components/ChildSwitcher";
import { SkeletonCard } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { useToast } from "../lib/ToastContext";

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "INDEPENDENT", label: "Kendi başına yapıyor" },
  { value: "WITH_REMINDER", label: "Hatırlatmayla yapıyor" },
  { value: "WITH_HELP", label: "Yardımla yapıyor" },
  { value: "NOT_YET", label: "Henüz yapmıyor" },
  { value: "NO_CHANCE_TO_OBSERVE", label: "Gözlemleyemedim" },
];

export function Development() {
  const { active, loading: childrenLoading } = useChildren();
  const toast = useToast();
  const [areas, setAreas] = useState<DevelopmentArea[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [summary, setSummary] = useState<Record<string, { average: number; observationCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string>("");

  useEffect(() => {
    api.developmentAreas().then(setAreas).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    Promise.all([api.skills(active.id), api.developmentSummary(active.id)])
      .then(([s, sum]) => {
        setSkills(s);
        setSummary(sum.areas);
      })
      .catch((err) => toast.show(err instanceof ApiError ? err.message : "Gelişim bilgileri yüklenemedi", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function recordLevel(skillId: string, level: SkillLevel) {
    if (!active) return;
    setSavingSkill(skillId);
    try {
      await api.observeSkill(active.id, { skillId, level });
      const sum = await api.developmentSummary(active.id);
      setSummary(sum.areas);
      toast.show("Gözlem kaydedildi.", "success");
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Kaydedilemedi", "error");
    } finally {
      setSavingSkill(null);
    }
  }

  if (childrenLoading) return <div className="screen"><SkeletonCard /></div>;
  if (!active) return <div className="center-msg">Önce bir çocuk profili oluşturun.</div>;

  const filteredSkills = activeArea ? skills.filter((s) => s.areaCode === activeArea) : skills;

  return (
    <>
      <div className="top-bar">
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Gelişim</h1>
        <ChildSwitcher />
      </div>
      <div className="screen">
        <p>{active.nickname} için yaşa uygun beceriler. Bu bir tanı ya da kıyaslama değildir.</p>

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="tabs">
              <button className={`tab-btn ${activeArea === "" ? "active" : ""}`} onClick={() => setActiveArea("")}>Tümü</button>
              {areas.map((a) => (
                <button
                  key={a.code}
                  className={`tab-btn ${activeArea === a.code ? "active" : ""}`}
                  onClick={() => setActiveArea(a.code)}
                >
                  {a.name}
                  {summary[a.code] ? ` · ${summary[a.code].observationCount}` : ""}
                </button>
              ))}
            </div>

            {filteredSkills.length === 0 && (
              <EmptyState icon="sprout" title="Bu alanda henüz madde yok" description="Çocuğunuzun yaşına uygun beceri maddeleri burada listelenir." />
            )}

            {filteredSkills.map((skill) => (
              <div key={skill.id} className="card skill-card">
                <p className="skill-text">{skill.text}</p>
                <div className="option-row">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className="option-chip"
                      disabled={savingSkill === skill.id}
                      onClick={() => recordLevel(skill.id, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
