"use client";

import { useState, useEffect, useCallback } from "react";

export interface BetSlipEntry {
  id: string; // unique key: `${homeTeam}|${awayTeam}|${leagueId}`
  homeTeam: string;
  awayTeam: string;
  leagueId: string;
  leagueName: string;
  minOdds: number;
  maxOdds: number;
  oddsType: "over" | "under";
  addedAt: number;
}

const STORAGE_KEY = "hoopedge_betslip";
const MAX_SLIP_SIZE = 20;

function loadFromStorage(): BetSlipEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BetSlipEntry[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: BetSlipEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function useBetSlip() {
  const [entries, setEntries] = useState<BetSlipEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setEntries(loadFromStorage());
    setHydrated(true);
  }, []);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEntries(loadFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const makeId = (homeTeam: string, awayTeam: string, leagueId: string) =>
    `${homeTeam}|${awayTeam}|${leagueId}`;

  const isInSlip = useCallback(
    (homeTeam: string, awayTeam: string, leagueId: string) =>
      entries.some((e) => e.id === makeId(homeTeam, awayTeam, leagueId)),
    [entries],
  );

  const addEntry = useCallback(
    (entry: Omit<BetSlipEntry, "id" | "addedAt">) => {
      const id = makeId(entry.homeTeam, entry.awayTeam, entry.leagueId);
      setEntries((prev) => {
        if (prev.some((e) => e.id === id)) return prev;
        if (prev.length >= MAX_SLIP_SIZE) return prev;
        const next = [{ ...entry, id, addedAt: Date.now() }, ...prev];
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    saveToStorage([]);
  }, []);

  const toggleEntry = useCallback(
    (entry: Omit<BetSlipEntry, "id" | "addedAt">) => {
      const id = makeId(entry.homeTeam, entry.awayTeam, entry.leagueId);
      setEntries((prev) => {
        const exists = prev.some((e) => e.id === id);
        if (!exists && prev.length >= MAX_SLIP_SIZE) return prev;
        const next = exists
          ? prev.filter((e) => e.id !== id)
          : [{ ...entry, id, addedAt: Date.now() }, ...prev];
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const isFull = entries.length >= MAX_SLIP_SIZE;

  return {
    entries,
    hydrated,
    isFull,
    isInSlip,
    addEntry,
    removeEntry,
    clearAll,
    toggleEntry,
  };
}
