import React from "react";
import FamilyTree from "../components/FamilyTree/FamilyTree";
import MemberCard from "../components/MemberCard/MemberCard";
import "./TreePage.css";

export default function TreePage() {
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
              <strong>Cabang Indo Jani</strong>
              <span>Damis Nusu · Maraunga</span>
            </div>
          </div>
          <div className="branch-badge branch-badge--b">
            <span className="branch-dot" style={{ background: "#10b981" }} />
            <div>
              <strong>Cabang Indo Sabi</strong>
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
