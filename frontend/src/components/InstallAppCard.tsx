import { useEffect, useState } from "react";
import { Icon } from "./Icon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallAppCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("kh_install_dismissed") === "1");

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;
  if (!deferred && !isIos()) return null;

  function dismiss() {
    localStorage.setItem("kh_install_dismissed", "1");
    setDismissed(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <div className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span className="icon-box" style={{ flexShrink: 0 }}><Icon name="download" size={20} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ marginBottom: 4 }}>Uygulamayı ana ekrana ekle</h2>
        {deferred ? (
          <>
            <p>Telefonunuza yükleyin, tarayıcı çubuğu olmadan tam ekran açılsın.</p>
            <button className="btn secondary sm" onClick={install}>Yükle</button>
          </>
        ) : (
          <p style={{ margin: 0 }}>
            Safari'de paylaş <Icon name="link" size={14} /> düğmesine, ardından <strong>"Ana Ekrana Ekle"</strong>'ye dokunun.
          </p>
        )}
      </div>
      <button className="link-btn" onClick={dismiss} aria-label="Kapat" style={{ fontSize: "1.1rem", lineHeight: 1 }}>×</button>
    </div>
  );
}
