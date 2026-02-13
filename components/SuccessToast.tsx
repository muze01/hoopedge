"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface SuccessToastProps {
  show: boolean;
  message: string;
  description?: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SuccessToast({
  show,
  message,
  description,
  onClose,
  autoClose = true,
  duration = 5000,
}: SuccessToastProps) {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 max-w-md">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">{message}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
