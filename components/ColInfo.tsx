"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface Pos {
  top: number;
  left: number;
}

export function ColInfo({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const getPos = (): Pos => {
    if (!btnRef.current) return { top: 0, left: 0 };
    const r = btnRef.current.getBoundingClientRect();
    return {
      top: r.top + window.scrollY - 8,
      left: r.left + window.scrollX + r.width / 2,
    };
  };

  const open = useCallback(() => {
    setPos(getPos());
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 5000);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Desktop handlers 
  const onMouseEnter = () => {
    open();
  };
  const onMouseLeave = () => {
    close();
  };

  // Mobile handlers 
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    visible ? close() : open();
  };

  const tooltip = visible ? (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className="w-52 px-3 py-2 rounded-lg shadow-xl bg-gray-900 text-white text-xs font-normal text-center normal-case tracking-normal whitespace-normal"
    >
      {text}
      {/* caret pointing down toward the icon */}
      <span
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className="border-4 border-transparent border-t-gray-900"
      />
    </div>
  ) : null;

  return (
    <span className="inline-flex items-center ml-1 align-middle">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchEnd={onTouchEnd}
        className="text-gray-400 hover:text-gray-600 focus:outline-none leading-none"
        aria-label={text}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="inline-block"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {mounted && createPortal(tooltip, document.body)}
    </span>
  );
}
