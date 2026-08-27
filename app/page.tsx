"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<any>(null);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;
    setLoading(true); setError(""); setParcel(null);
    try {
      const base = process.env.NEXT_PUBLIC_TRACKING_FUNCTION_URL;
      if (!base) throw new Error("Tracking service is not configured.");
      const res = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: value }) });
      const data = await res.json();
      if (!res.ok || !data.parcel) throw new Error(data.error || "We couldn't find that tracking code.");
      setParcel(data.parcel);
    } catch (err: any) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="/"><span className="brandmark">S</span><span>Safarlink <b>Parcel</b></span></a><button className="install" onClick={() => window.dispatchEvent(new Event("safarlink-install"))}>Install</button></header>
    <section className="hero">
      <div className="eyebrow"><span className="pulse"/> Safarlink parcel tracking</div>
      <h1>Know where your<br/><em>parcel is.</em></h1>
      <p className="lead">Enter your tracking code to see the latest status of your shipment.</p>
      <form className="trackbox" onSubmit={track}>
        <div className="inputwrap"><span>⌕</span><input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter tracking code" aria-label="Tracking code" autoCapitalize="characters" /></div>
        <button className="trackbtn" disabled={loading}>{loading ? "Checking…" : "Track parcel →"}</button>
      </form>
      {error && <div className="error" role="alert">{error}</div>}
      {parcel && <section className="result" aria-live="polite">
        <div className="resulthead"><div><small>TRACKING CODE</small><strong>{parcel.tracking_code}</strong></div><span className="status">{parcel.status}</span></div>
        <div className="details"><div><small>RECIPIENT</small><strong>{parcel.recipient_name}</strong></div><div><small>ITEM</small><strong>{parcel.item}</strong></div><div><small>FROM</small><strong>{parcel.origin || "—"}</strong></div><div><small>TO</small><strong>{parcel.destination || "—"}</strong></div></div>
        <div className="updated">● &nbsp;Last updated {parcel.updated_at ? new Date(parcel.updated_at).toLocaleString() : "recently"}</div>
      </section>}
    </section>
    <footer><span>© Safarlink</span><span>Secure read-only tracking</span></footer>
  </main>;
}
