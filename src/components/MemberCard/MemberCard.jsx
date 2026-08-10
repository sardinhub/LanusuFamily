import React from "react";
import { useApp } from "../../context/AppContext";
import "./MemberCard.css";

const BRANCH_LABELS = {
  root: { label: "Leluhur", class: "badge-gold" },
  "indo-jani": { label: "Garis Keturunan Indo Jani", class: "badge-branch-a" },
  "indo-sabi": { label: "Garis Keturunan Indo Sabi", class: "badge-branch-b" },
};

const GENDER_ICON = { L: "👨", P: "👩" };

export default function MemberCard() {
  const { selectedMember, clearSelectedMember, anggotaFlat } = useApp();
  if (!selectedMember) return null;

  const branch = BRANCH_LABELS[selectedMember.cabang] || BRANCH_LABELS["root"];

  let parentNameStr = "-";
  if (selectedMember._parentObj) {
    const parentObj = selectedMember._parentObj;
    if (parentObj.id === "la-nusu") {
      const ibuName = selectedMember.cabang === "indo-jani" ? "Indo Jani" : selectedMember.cabang === "indo-sabi" ? "Indo Sabi" : "";
      parentNameStr = ibuName ? `${parentObj.nama} & ${ibuName}` : parentObj.nama;
    } else {
      const spouseName = parentObj.pasangan?.[0]?.nama;
      parentNameStr = spouseName ? `${parentObj.nama} & ${spouseName}` : parentObj.nama;
    }
  } else if (selectedMember.parent_id && anggotaFlat) {
    // Fallback if not clicked from tree
    const parentObj = anggotaFlat.find(a => a.id === selectedMember.parent_id);
    parentNameStr = parentObj ? parentObj.nama : "-";
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) clearSelectedMember();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box member-card">
        {/* Close */}
        <button className="member-card-close btn btn-ghost btn-sm" onClick={clearSelectedMember}>
          ✕
        </button>

        {/* Avatar */}
        <div className={`member-avatar member-avatar--${selectedMember.cabang}`}>
          {selectedMember.foto ? (
            <img src={selectedMember.foto} alt={selectedMember.nama} />
          ) : (
            <span className="member-avatar-icon">
              {GENDER_ICON[selectedMember.jenis_kelamin] || "👤"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="member-card-body">
          <div className="member-card-badges">
            <span className={`badge ${branch.class}`}>{branch.label}</span>
            {selectedMember.meninggal && (
              <span className="badge badge-belum">Almarhum/ah</span>
            )}
          </div>

          <h2 className="member-card-name">{selectedMember.nama}</h2>
          <p className="member-card-gelar">{selectedMember.gelar}</p>

          <div className="member-card-details">
            {selectedMember.parent_id && (
              <div className="member-detail-row">
                <span className="detail-label">👨‍👩‍👦 Anak dari</span>
                <span className="detail-value">{parentNameStr}</span>
              </div>
            )}
            {selectedMember.lahir && (
              <div className="member-detail-row">
                <span className="detail-label">🎂 Lahir</span>
                <span className="detail-value">{selectedMember.lahir}</span>
              </div>
            )}
            {selectedMember.meninggal && (
              <div className="member-detail-row">
                <span className="detail-label">🕊️ Meninggal</span>
                <span className="detail-value">{selectedMember.meninggal}</span>
              </div>
            )}
            {selectedMember.pasangan?.length > 0 && (
              <div className="member-detail-row">
                <span className="detail-label">💑 Pasangan</span>
                <span className="detail-value">
                  {selectedMember.pasangan.map((p) => p.nama).join(", ")}
                </span>
              </div>
            )}
            {selectedMember.keterangan && (
              <div className="member-detail-row">
                <span className="detail-label">📝 Keterangan</span>
                <span className="detail-value">{selectedMember.keterangan}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
