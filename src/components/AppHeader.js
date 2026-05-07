"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/feed", label: "Feed" },
  { href: "/niches", label: "Niche Map" },
  { href: "/prompts", label: "Prompts" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function AppHeader({ username }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signing, setSigning] = useState(false);

  const signOut = async () => {
    setSigning(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div>
          <Link href="/feed" className="logo">10TOES HQ</Link>
          <div className="logo-sub mono">TYPE BEATS COMMAND CENTER</div>
        </div>
        <nav className="nav" style={{ overflowX: "auto" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className={`nav-btn${pathname.startsWith(n.href) ? " active" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {username && (
            <Link href={`/producer/${username}`} className="nav-btn" style={{ gap: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>
                {username[0].toUpperCase()}
              </span>
              {username}
            </Link>
          )}
          <button onClick={signOut} disabled={signing} className="btn btn-secondary btn-sm">
            {signing ? "…" : "Sign Out"}
          </button>
        </div>
      </div>
    </header>
  );
}
