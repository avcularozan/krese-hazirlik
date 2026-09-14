import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { ApiError } from "../lib/api";
import { Icon } from "../components/Icon";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(email, password, displayName);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kayıt olunamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-brand-mark">🌱</div>
        <div>
          <h1 style={{ marginBottom: 0 }}>Hesap oluştur</h1>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Kıyaslama yok, sadece kendi izleminiz</p>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="displayName">Adınız (opsiyonel)</label>
        <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <label htmlFor="email">E-posta</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Şifre (en az 8 karakter)</label>
        <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Oluşturuluyor…" : "Hesap oluştur"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Zaten hesabınız var mı? <Link to="/login" className="link-btn" style={{ textDecoration: "none" }}>Giriş yapın</Link>
      </p>
    </div>
  );
}
