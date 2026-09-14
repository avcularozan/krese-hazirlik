import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Child } from "./api";
import { useAuth } from "./AuthContext";

interface ChildState {
  loading: boolean;
  children: Child[];
  active: Child | null;
  setActiveId: (id: string) => void;
  refresh: () => Promise<void>;
}

const ChildContext = createContext<ChildState | null>(null);

export function ChildProvider({ children: nodes }: { children: ReactNode }) {
  const { me } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem("kh_active_child"));

  const refresh = useCallback(async () => {
    if (!me) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const kids = await api.children();
      setList(kids);
      if (kids.length && !kids.some((k) => k.id === activeId)) {
        setActiveId(kids[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [me, activeId]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  useEffect(() => {
    if (activeId) localStorage.setItem("kh_active_child", activeId);
  }, [activeId]);

  const active = list.find((c) => c.id === activeId) ?? null;

  return (
    <ChildContext.Provider value={{ loading, children: list, active, setActiveId, refresh }}>
      {nodes}
    </ChildContext.Provider>
  );
}

export function useChildren() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChildren must be used within ChildProvider");
  return ctx;
}
