import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setOpen(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!open || !deferred) return null;

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setOpen(false);
    setDeferred(null);
  };

  return (
    <div className="install-banner">
      <div>
        <strong style={{ display: 'block', marginBottom: 4 }}>Get the PulseForge app — free</strong>
        <span style={{ color: 'var(--site-muted)', fontSize: 13 }}>
          Install on this phone, tablet, or desktop. No store. No fee. Your next session starts here.
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button className="btn-ember" type="button" onClick={install} style={{ animation: 'none' }}>
          <Download size={14} /> Install
        </button>
        <button className="btn-ghost" type="button" onClick={() => setOpen(false)} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
