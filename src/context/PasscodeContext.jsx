import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const PASSCODE = "0000"; // PIN keluarga
const SESSION_KEY = "lanusu_guest";
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

const PasscodeContext = createContext(null);

export function PasscodeProvider({ children }) {
  const [guestMode, setGuestMode] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(null); // timestamp ms

  // Hitung sisa waktu cooldown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownUntil) {
        setCooldownUntil(null);
        setAttempts(0);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownLeft = cooldownUntil
    ? Math.ceil((cooldownUntil - now) / 1000)
    : 0;
  const isLockedOut = cooldownLeft > 0;

  /**
   * Verifikasi PIN. Return:
   *   "ok"       — berhasil
   *   "wrong"    — salah PIN
   *   "locked"   — masih dalam cooldown
   *   "maxed"    — baru saja mencapai batas, mulai cooldown
   */
  const verifyPasscode = useCallback((pin) => {
    if (isLockedOut) return "locked";

    if (pin === PASSCODE) {
      setAttempts(0);
      setGuestMode(true);
      try { sessionStorage.setItem(SESSION_KEY, "true"); } catch {}
      return "ok";
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000);
      return "maxed";
    }
    return "wrong";
  }, [attempts, isLockedOut]);

  const exitGuest = useCallback(() => {
    setGuestMode(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  return (
    <PasscodeContext.Provider value={{
      guestMode,
      verifyPasscode,
      exitGuest,
      isLockedOut,
      cooldownLeft,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
    }}>
      {children}
    </PasscodeContext.Provider>
  );
}

export function usePasscode() {
  return useContext(PasscodeContext);
}
