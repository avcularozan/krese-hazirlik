import { useChildren } from "../lib/ChildContext";

export function ChildSwitcher() {
  const { children, active, setActiveId } = useChildren();
  if (children.length < 2) return null;
  return (
    <select value={active?.id ?? ""} onChange={(e) => setActiveId(e.target.value)}>
      {children.map((c) => (
        <option key={c.id} value={c.id}>{c.nickname}</option>
      ))}
    </select>
  );
}
