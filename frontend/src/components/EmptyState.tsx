import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function EmptyState({
  icon = "sprout",
  title,
  description,
  action,
}: {
  icon?: "sprout" | "dice" | "chart" | "calendar" | "sparkle";
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon name={icon} size={30} /></div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
