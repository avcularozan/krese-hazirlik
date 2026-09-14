import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { ApiError } from "../lib/api";
import { Icon } from "../components/Icon";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-brand-mark">🌱</div>
        <div>
          <h1 style={{ marginBottom: 0 }}>Kreşe Hazırlık</h1>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Çocuğunuzun kendi yolculuğu</p>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">E-posta</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Şifre</label>
        <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error-text"><Icon name="info" size={16} />{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Hesabınız yok mu? <Link to="/register" className="link-btn" style={{ textDecoration: "none" }}>Kayıt olun</Link>
      </p>
    </div>
  );
}
