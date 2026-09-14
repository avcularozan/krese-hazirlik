import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";

const TABS = [
  { to: "/today", icon: "home", label: "Bugün" },
  { to: "/development", icon: "sprout", label: "Gelişim" },
  { to: "/activities", icon: "dice", label: "Etkinlikler" },
  { to: "/reports", icon: "chart", label: "Raporlar" },
  { to: "/profile", icon: "user", label: "Profil" },
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? "active" : "")}>
          <Icon name={tab.icon} size={22} strokeWidth={tab.icon === "home" ? 1.8 : 1.8} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
