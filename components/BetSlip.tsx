"use client";

import { useState } from "react";
import { useBetSlip, BetSlipEntry } from "@/hooks/use-bet-slip";

export { useBetSlip };
export type { BetSlipEntry };

interface BetSlipProps {
  entries: BetSlipEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function OddsTypeBadge({ type }: { type: "over" | "under" }) {
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        type === "over"
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {type}
    </span>
  );
}

export function BetSlip({ entries, onRemove, onClearAll }: BetSlipProps) {
  const [open, setOpen] = useState(false);
  const count = entries.length;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close bet slip" : "Open bet slip"}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
      >
        {/* Ticket icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 shrink-0"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2M13 17v2M13 11v2" />
        </svg>

        <span className="hidden sm:inline">Bet Slip</span>

        {/* Counter badge */}
        {count > 0 && (
          <span className="bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Slip panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2M13 17v2M13 11v2" />
              </svg>
              <span className="font-bold text-sm">Bet Slip</span>
              <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count} {count === 1 ? "game" : "games"}
                {count >= 20 && " · max"}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Entries */}
          <div className="overflow-y-auto max-h-[55vh] divide-y divide-gray-100">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 mb-2 opacity-40"
                >
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2M13 17v2M13 11v2" />
                </svg>
                <p className="text-sm font-medium">Your slip is empty</p>
                <p className="text-xs mt-1 text-gray-400">
                  Analyze a matchup and hit&nbsp;
                  <span className="font-semibold text-blue-500">
                    + Add to Slip
                  </span>
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <SlipRow key={entry.id} entry={entry} onRemove={onRemove} />
              ))
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClearAll}
                className="w-full text-sm font-medium text-red-500 hover:text-red-700 transition-colors py-1 cursor-pointer"
              >
                Remove all
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SlipRow({
  entry,
  onRemove,
}: {
  entry: BetSlipEntry;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0">
        {/* Teams */}
        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
          {entry.homeTeam}
          <span className="text-gray-400 font-normal mx-1">vs</span>
          {entry.awayTeam}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <OddsTypeBadge type={entry.oddsType} />
          <span className="text-xs text-gray-500">
            Odds&nbsp;
            <span className="font-medium text-gray-700">
              {entry.minOdds.toFixed(2)}–{entry.maxOdds.toFixed(2)}
            </span>
          </span>
          {entry.leagueName && (
            <span className="text-[10px] text-gray-400 truncate max-w-25">
              {entry.leagueName}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(entry.id)}
        aria-label={`Remove ${entry.homeTeam} vs ${entry.awayTeam}`}
        className="shrink-0 text-gray-300 hover:text-red-500 transition-colors ml-1 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      </button>
    </div>
  );
}
