import React, { useState, useEffect, useCallback } from "react";
import { usePasscode } from "../../context/PasscodeContext";
import "./PasscodeModal.css";

const PIN_LENGTH = 4;

export default function PasscodeModal({ onClose }) {
  const { verifyPasscode, isLockedOut, cooldownLeft, attemptsLeft } = usePasscode();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | wrong | maxed | ok

  const handleKey = useCallback((val) => {
    if (isLockedOut) return;
    if (val === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + val;
    setPin(next);

    if (next.length === PIN_LENGTH) {
      // Auto-verify
      setTimeout(() => {
        const result = verifyPasscode(next);
        if (result === "ok") {
          setStatus("ok");
          setTimeout(onClose, 300);
        } else {
          setStatus(result);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin("");
            setStatus("idle");
          }, 700);
        }
      }, 150);
    }
  }, [pin, verifyPasscode, isLockedOut, onClose]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      if (e.key === "Backspace") handleKey("del");
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey, onClose]);

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  const statusMsg = () => {
    if (isLockedOut) return `🔒 Terlalu banyak percobaan. Tunggu ${cooldownLeft} detik.`;
    if (status === "wrong") return `❌ PIN salah. ${attemptsLeft} percobaan tersisa.`;
    if (status === "maxed") return `🔒 Terlalu banyak percobaan. Tunggu ${COOLDOWN_SECONDS} detik.`;
    return null;
  };

  const COOLDOWN_SECONDS = 30;

  return (
    <div className="passcode-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`passcode-modal ${shake ? "passcode-shake" : ""}`}>
        {/* Close */}
        <button className="passcode-close" onClick={onClose} aria-label="Tutup">✕</button>

        {/* Header */}
        <div className="passcode-header">
          <div className="passcode-icon">🏡</div>
          <h2 className="passcode-title">Masukkan PIN Keluarga</h2>
          <p className="passcode-desc">PIN 4 digit yang dibagikan oleh Admin keluarga La Nusu</p>
        </div>

        {/* Dot indicators */}
        <div className="passcode-dots">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`passcode-dot ${i < pin.length ? "filled" : ""} ${status === "ok" && i < pin.length ? "success" : ""}`}
            />
          ))}
        </div>

        {/* Error message */}
        {statusMsg() && (
          <div className={`passcode-msg ${isLockedOut || status === "maxed" ? "locked" : "error"}`}>
            {statusMsg()}
          </div>
        )}

        {/* Cooldown countdown */}
        {isLockedOut && (
          <div className="passcode-cooldown">
            <div className="passcode-cooldown-bar" style={{ width: `${(cooldownLeft / COOLDOWN_SECONDS) * 100}%` }} />
          </div>
        )}

        {/* Numpad */}
        <div className="passcode-numpad">
          {keys.map((row, ri) => (
            <div key={ri} className="passcode-row">
              {row.map((k, ki) => (
                k === "" ? (
                  <div key={ki} className="passcode-key passcode-key--empty" />
                ) : (
                  <button
                    key={ki}
                    className={`passcode-key ${k === "del" ? "passcode-key--del" : ""}`}
                    onClick={() => handleKey(k)}
                    disabled={isLockedOut}
                    aria-label={k === "del" ? "Hapus" : k}
                  >
                    {k === "del" ? "⌫" : k}
                  </button>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
