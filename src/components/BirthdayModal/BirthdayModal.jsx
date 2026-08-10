import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./BirthdayModal.css";

export default function BirthdayModal() {
  const { silsilah, anggotaFlat } = useApp();
  const [birthdays, setBirthdays] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!anggotaFlat || anggotaFlat.length === 0) return;

    // Cek sessionStorage agar tidak spam setiap kali pindah halaman
    const hasShown = sessionStorage.getItem("birthdayModalShown");
    if (hasShown) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const todayBirthdays = [];

    // Fungsi helper untuk cek ultah
    const checkBirthday = (person, type = "Anggota") => {
      if (person.tanggal_lahir && !person.meninggal) {
        const bDate = new Date(person.tanggal_lahir);
        if (!isNaN(bDate.getTime()) && bDate.getMonth() === currentMonth && bDate.getDate() === currentDay) {
          const age = today.getFullYear() - bDate.getFullYear();
          todayBirthdays.push({
            id: person.id || Math.random().toString(),
            nama: person.nama,
            age: age,
            type: type
          });
        }
      }
    };

    // 1. Cek anggota dari anggotaFlat
    anggotaFlat.forEach(member => checkBirthday(member, "Anggota Keluarga"));

    // 2. Cek pasangan dengan traverse silsilah
    // Karena pasangan_list ter-nested di silsilah
    const traverseAndCheck = (node) => {
      if (!node) return;
      if (node.pasangan && Array.isArray(node.pasangan)) {
        node.pasangan.forEach(p => checkBirthday(p, "Pasangan"));
      }
      if (node.anak && Array.isArray(node.anak)) {
        node.anak.forEach(child => traverseAndCheck(child));
      }
    };
    traverseAndCheck(silsilah);

    if (todayBirthdays.length > 0) {
      setBirthdays(todayBirthdays);
      setIsOpen(true);
      sessionStorage.setItem("birthdayModalShown", "true");
    }
  }, [anggotaFlat, silsilah]);

  if (!isOpen || birthdays.length === 0) return null;

  return (
    <div className="modal-overlay birthday-overlay">
      <div className="birthday-modal pop-in">
        <div className="confetti-bg"></div>
        <button className="birthday-close btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>✕</button>
        
        <div className="birthday-header">
          <span className="birthday-icon-large">🎉</span>
          <h2>Selamat Ulang Tahun!</h2>
          <p>Hari ini adalah hari yang spesial untuk keluarga kita.</p>
        </div>

        <div className="birthday-list">
          {birthdays.map((b, idx) => (
            <div key={idx} className="birthday-card glass-card">
              <div className="birthday-card-icon">🎂</div>
              <div className="birthday-card-info">
                <h3>{b.nama}</h3>
                <p>Selamat ulang tahun yang ke-<strong>{b.age}</strong>!</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="btn btn-primary btn-glow" style={{width: '100%', marginTop: '24px'}} onClick={() => setIsOpen(false)}>
          Tutup
        </button>
      </div>
    </div>
  );
}
