"use client";

import React, { useId } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useModalA11y } from "../hooks/useModalA11y";

/**
 * Confirmation dialog for destructive actions.
 *
 * Uses useModalA11y for dialog semantics, Escape, focus trap and focus
 * restore. The cancel button is rendered first so it receives initial focus:
 * for a destructive action the safe choice should be the one already selected
 * when the dialog opens.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isProcessing = false,
  tone = "danger",
}) {
  const titleId = useId();
  const descId = useId();
  // While the action is running the dialog must not be dismissable, or the
  // user can close it and lose sight of an in-flight destructive operation.
  const dialogRef = useModalA11y(isOpen, isProcessing ? undefined : onClose);

  if (!isOpen) return null;

  const confirmClasses =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideIn outline-none"
      >
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              tone === "danger" ? "bg-red-100" : "bg-blue-100"
            }`}
            aria-hidden="true"
          >
            <AlertTriangle
              className={tone === "danger" ? "text-red-600" : "text-blue-600"}
              size={20}
            />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-800">
              {title}
            </h2>
            <p id={descId} className="text-sm text-slate-600 mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClasses}`}
          >
            {isProcessing && (
              <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            )}
            {isProcessing ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
