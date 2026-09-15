import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./lib/AuthContext";
import { ChildProvider, useChildren } from "./lib/ChildContext";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Onboarding } from "./pages/Onboarding";
import { Today } from "./pages/Today";
import { Development } from "./pages/Development";
import { Activities } from "./pages/Activities";
import { Reports } from "./pages/Reports";
import { Profile } from "./pages/Profile";
import { TeacherForm } from "./pages/TeacherForm";

function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, me } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="center-msg">Yükleniyor…</div>;
  if (!me) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequireChild({ children }: { children: ReactNode }) {
  const { loading, children: kids } = useChildren();
  if (loading) return <div className="center-msg">Yükleniyor…</div>;
  if (kids.length === 0) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppTab({ children }: { children: ReactNode }) {
  return (
    <RequireChild>
      {children}
      <BottomNav />
    </RequireChild>
  );
}

function Root() {
  const { me, ready } = useAuth();
  if (!ready) return <div className="center-msg">Yükleniyor…</div>;
  return <Navigate to={me ? "/today" : "/login"} replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ogretmen/:codeId" element={<TeacherForm />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ChildProvider>
                <Routes>
                  <Route path="onboarding" element={<Onboarding />} />
                  <Route path="today" element={<AppTab><Today /></AppTab>} />
                  <Route path="development" element={<AppTab><Development /></AppTab>} />
                  <Route path="activities" element={<AppTab><Activities /></AppTab>} />
                  <Route path="reports" element={<AppTab><Reports /></AppTab>} />
                  <Route path="profile" element={<AppTab><Profile /></AppTab>} />
                  <Route path="*" element={<Navigate to="/today" replace />} />
                </Routes>
              </ChildProvider>
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
