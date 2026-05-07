"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({ profile, email }) {
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const saveBio = async (e) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ bio }).eq("id", profile.id);
    setSaving(false);
    showToast("Profile updated ✅");
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  };

  const subColor = profile?.subscription_status === "active" ? "var(--green)" : "var(--red)";
  const subLabel = profile?.subscription_status === "active" ? "✅ Active" : "❌ Inactive";

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Settings</h1>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>PROFILE</h2>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">PRODUCER HANDLE</label>
          <div className="field-input" style={{ color: "var(--dim)", cursor: "not-allowed" }}>@{profile?.username}</div>
          <p style={{ fontSize: 10, color: "var(--dim)", marginTop: 4 }}>Handle cannot be changed after setup.</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">EMAIL</label>
          <div className="field-input" style={{ color: "var(--dim)", cursor: "not-allowed" }}>{email}</div>
        </div>
        <form onSubmit={saveBio}>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">BIO</label>
            <textarea className="field-input" value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={160} placeholder="Tell the community about your sound…" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? "Saving…" : "Save Bio"}</button>
        </form>
      </div>

      {/* Subscription */}
      <div className="card">
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>SUBSCRIPTION</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>10TOES HQ — $7.99/month</div>
            <div style={{ fontSize: 12, color: subColor, fontWeight: 600, marginTop: 3 }}>{subLabel}</div>
          </div>
        </div>
        <button onClick={openBillingPortal} className="btn btn-secondary" disabled={portalLoading} style={{ width: "100%" }}>
          {portalLoading ? "Loading…" : "Manage Subscription via Stripe →"}
        </button>
        <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 10 }}>You can cancel, update payment method, or view invoices in the Stripe portal.</p>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
