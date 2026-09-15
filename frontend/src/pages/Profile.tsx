import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, type TeacherCode } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { useChildren } from "../lib/ChildContext";
import { ChildSwitcher } from "../components/ChildSwitcher";
import { Icon } from "../components/Icon";
import { InstallAppCard } from "../components/InstallAppCard";
import { useToast } from "../lib/ToastContext";

export function Profile() {
  const { me, logout } = useAuth();
  const { active, loading: childrenLoading } = useChildren();
  const navigate = useNavigate();
  const toast = useToast();
  const [teacherCode, setTeacherCode] = useState<TeacherCode | null>(null);
  const [busy, setBusy] = useState(false);

  async function createCode() {
    if (!active) return;
    setBusy(true);
    try {
      const code = await api.createTeacherCode(active.id);
      setTeacherCode(code);
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Kod oluşturulamadı", "error");
    } finally {
      setBusy(false);
    }
  }

  async function exportData() {
    if (!active) return;
    setBusy(true);
    try {
      const data = await api.exportData(active.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Dışa aktarılamadı", "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Hesabınız ve tüm çocuk verileriniz geri dönüşsüz silinecek. Emin misiniz?")) return;
    setBusy(true);
    try {
      await api.deleteAccount();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Silinemedi", "error");
    } finally {
      setBusy(false);
    }
  }

  const initial = (me?.displayName || me?.email || "?").charAt(0).toUpperCase();

  return (
    <>
      <div className="top-bar">
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Profil</h1>
        <ChildSwitcher />
      </div>
      <div className="screen">
        <InstallAppCard />
        <div className="card">
          <div className="profile-row">
            <div className="profile-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--text)", fontWeight: 700, margin: 0 }}>{me?.displayName || "İsimsiz"}</p>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>{me?.email}</p>
            </div>
          </div>
          <button className="settings-item" onClick={logout} style={{ marginTop: 4 }}>
            <span className="icon-box"><Icon name="logout" size={18} /></span>
            <span className="title">Çıkış yap</span>
          </button>
        </div>

        {!childrenLoading && active && (
          <>
            <div className="card">
              <h2>{active.nickname}</h2>
              <p style={{ margin: 0 }}>
                {new Date(active.birthDate).toLocaleDateString("tr-TR")} doğumlu · {active.ageMonths} aylık
                {active.enrollment && <> · okula başlama: {new Date(active.enrollment.startDate).toLocaleDateString("tr-TR")}</>}
              </p>
            </div>

            <div className="card">
              <h2>Öğretmen bağlantısı</h2>
              <p>Öğretmen, hesap açmadan bu kodla gözlem girebilir. Sizin geçmiş kayıtlarınızı göremez.</p>
              <button className="btn secondary" onClick={createCode} disabled={busy}>
                <Icon name="link" size={18} />
                {busy ? "Oluşturuluyor…" : "Yeni kod oluştur"}
              </button>
              {teacherCode && (
                <div className="list-item" style={{ marginTop: 12, textAlign: "center" }}>
                  <p style={{ color: "var(--accent)", fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: "0.1em" }}>
                    {teacherCode.code}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
                    Son geçerlilik: {new Date(teacherCode.expiresAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <h2>Gizlilik ve veri</h2>
              <button className="settings-item" onClick={exportData} disabled={busy}>
                <span className="icon-box"><Icon name="download" size={18} /></span>
                <span className="title">Verilerimi dışa aktar</span>
              </button>
              <button className="settings-item danger" onClick={deleteAccount} disabled={busy}>
                <span className="icon-box"><Icon name="trash" size={18} /></span>
                <span className="title">Hesabımı ve verilerimi sil</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
