"use client";

import React, { useId } from "react";
import { Loader2 } from "lucide-react";
import { useModalA11y } from "../hooks/useModalA11y";

/**
 * Confirmation dialog for destructive actions.
 *
 * Uses useModalA11y for dialog semantics, Escape, focus trap and focus
 * restore. The cancel button comes first in DOM order so it receives initial
 * focus: for a destructive action the safe choice should already be selected.
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
  // While the action runs the dialog must not be dismissable, or the user can
  // close it and lose sight of an in-flight destructive operation.
  const dialogRef = useModalA11y(isOpen, isProcessing ? undefined : onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 scrim animate-fadeIn"
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
        className="panel w-full max-w-[480px] p-6 shadow-overlay outline-none animate-slideIn"
      >
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-ink-2">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="btn btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
          >
            {isProcessing && (
              <Loader2 size={16} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden="true" />
            )}
            {isProcessing ? "Deleting" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
