"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_TRACKER_API_URL ?? "https://qjidxeyaxytiqfevqniv.supabase.co/functions/v1/track-parcel";

type Parcel = {
  trackingCode: string;
  recipientName: string;
  item: { category: string; description: string | null; quantity: number };
  status: string;
  updatedAt: string;
};

function formatStatus(status: string) {
  return status.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function Home() {
  const [code, setCode] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const deferredPrompt = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const handler = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as typeof deferredPrompt.current;
      setInstallReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!deferredPrompt.current) {
      window.alert("Use your browser menu and choose ‘Install app’ or ‘Add to Home Screen’.");
      return;
    }
    await deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setInstallReady(false);
  }

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setParcel(null);
    setError("");
    if (!/^[A-Z0-9-]{4,40}$/.test(normalized)) {
      setError("Enter a valid tracking code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: normalized }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "We couldn't find that parcel.");
      setParcel(data.parcel as Parcel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <nav className="topbar" aria-label="Main navigation">
        <div className="brand" aria-label="Safarlink Parcel">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>Safarlink <strong>Parcel</strong></span>
        </div>
        <div className="topbar-actions">
          <span className="read-only"><i /> Read-only</span>
          <button className="install-button" onClick={installApp} type="button" aria-label="Install Safarlink Parcel">
            <span aria-hidden="true">↓</span> Install
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> SAFARLINK TRACKING</div>
        <h1>Know where your<br /><em>parcel is.</em></h1>
        <p className="hero-copy">Enter your tracking code to see the latest parcel status, recipient and item details.</p>

        <form className="track-card" onSubmit={track} noValidate>
          <label htmlFor="tracking-code">Tracking code</label>
          <div className={`input-row ${error ? "has-error" : ""}`}>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              id="tracking-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SL-28491"
              autoComplete="off"
              inputMode="text"
              maxLength={40}
              spellCheck={false}
              aria-describedby={error ? "tracking-error" : undefined}
            />
            <button className="track-button" type="submit" disabled={loading}>
              {loading ? "Checking…" : "Track parcel"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>
          {error && <p id="tracking-error" className="error-message" role="alert">{error}</p>}
          <p className="privacy-note"><span aria-hidden="true">⌁</span> This tracker can only view parcel information. It cannot change anything.</p>
        </form>

        {parcel && (
          <section className="result-card" aria-live="polite">
            <div className="result-head">
              <div>
                <p className="result-label">PARCEL FOUND</p>
                <h2>{parcel.trackingCode}</h2>
              </div>
              <span className="status-pill"><span /> {formatStatus(parcel.status)}</span>
            </div>

            <div className="details-grid">
              <div className="detail-block">
                <span className="detail-label">Recipient</span>
                <strong>{parcel.recipientName}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Item</span>
                <strong>{parcel.item.description || parcel.item.category}</strong>
                <small>{parcel.item.quantity} {parcel.item.quantity === 1 ? "item" : "items"} · {parcel.item.category}</small>
              </div>
              <div className="detail-block wide">
                <span className="detail-label">Last updated</span>
                <strong>{formatDate(parcel.updatedAt)}</strong>
              </div>
            </div>
          </section>
        )}
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Safarlink</span>
        <span className="footer-separator">•</span>
        <span>Parcel tracking made simple.</span>
      </footer>
    </main>
  );
}
