import React from "react";
import FamilyTree from "../components/FamilyTree/FamilyTree";
import MemberCard from "../components/MemberCard/MemberCard";
import { useApp } from "../context/AppContext";
import "./TreePage.css";

export default function TreePage() {
  const { loading, silsilah } = useApp();

  if (loading) {
    return (
      <div className="page-content page-fade">
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="loading-state">
            <div className="loading-spinner" />
            <p style={{ marginTop: 16 }}>Memuat data silsilah keluarga...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!silsilah) {
    return (
      <div className="page-content page-fade">
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
            <h2>⚠️ Database Kosong</h2>
            <p>Data silsilah belum dimuat. Pastikan Anda sudah menjalankan script <code>seed.sql</code> di Supabase.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-fade">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">🌳</div>
          <div>
            <h1>Silsilah Keluarga La Nusu</h1>
            <p>Pohon keluarga interaktif — klik nama untuk melihat detail anggota</p>
          </div>
        </div>

        <div className="tree-branch-legend">
          <div className="branch-badge branch-badge--a">
            <span className="branch-dot" style={{ background: "#3b82f6" }} />
            <div>
              <strong>Garis Keturunan Indo Jani</strong>
              <span>Damis Nusu · Maraunga</span>
            </div>
          </div>
          <div className="branch-badge branch-badge--b">
            <span className="branch-dot" style={{ background: "#10b981" }} />
            <div>
              <strong>Garis Keturunan Indo Sabi</strong>
              <span>Munawarah · Kamarullah</span>
            </div>
          </div>
        </div>

        <FamilyTree />
        <MemberCard />
      </div>
    </div>
  );
}
